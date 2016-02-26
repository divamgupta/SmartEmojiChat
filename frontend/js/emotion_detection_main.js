var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

/********** check and set up video/webcam **********/

function enablestart() {
	var startbutton = document.getElementById('startbutton');
	startbutton.value = "start";
	startbutton.disabled = null;
}

/*var insertAltVideo = function(video) {
	if (supports_video()) {
		if (supports_ogg_theora_video()) {
			video.src = "../media/cap12_edit.ogv";
		} else if (supports_h264_baseline_video()) {
			video.src = "../media/cap12_edit.mp4";
		} else {
			return false;
		}
		//video.play();
		return true;
	} else return false;
}*/
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
	// set up stream
	
	var videoSelector = {video : true};
	if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
		var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
		if (chromeVersion < 20) {
			videoSelector = "video";
		}
	};

	navigator.getUserMedia(videoSelector, function( stream ) {
		if (vid.mozCaptureStream) {
			vid.mozSrcObject = stream;
		} else {
			vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
		}
		vid.play();
	}, function() {
		//insertAltVideo(vid);
		alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
	});
} else {
	//insertAltVideo(vid);
	alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
}

vid.addEventListener('canplay', enablestart, false);

/*********** setup of emotion detection *************/

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);

function startVideo() {
	// start video
	vid.play();
	// start tracking
	ctrack.start(vid);
	// start loop to draw face
	drawLoop();
}

getDistanceRaw = function(x1, y1, x2, y2) {
	return Math.abs(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
};

getDistancePoints = function(p1, p2){
	// console.log("joojo", p1);
	console.log(p1);
	console.log(p2);
	if (typeof p1 == undefined) p1 = [0, 0];
	if (typeof p2 == undefined) p2 = [1, 1];
	return getDistanceRaw(p1[0], p1[1], p2[0], p2[1]);
}
function drawLoop() {
	requestAnimFrame(drawLoop);
	overlayCC.clearRect(0, 0, 400, 300);
	//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
	var positions = ctrack.getCurrentPosition();
	if (positions) {
		ctrack.draw(overlay);
	}
	// console.log(positions[44], positions[50]);

	if( typeof SendMessage != 'undefined')
	{
		var dMouthHorizontal = getDistancePoints(positions[44], positions[50]);
		var dMouthVertical = getDistancePoints(positions[60], positions[57]);
		var dLeftEyebrow1 = getDistancePoints(positions[24], positions[21]);
		var dLeftEyebrow2 = getDistancePoints(positions[24], positions[26]);
		var indicator1 = ((dLeftEyebrow2 - dLeftEyebrow1) / Math.max(dLeftEyebrow1, dLeftEyebrow2)) * 15;

		var dRightEyebrow1 = getDistancePoints(positions[29], positions[31]);
		var dRightEyebrow2 = getDistancePoints(positions[29], positions[16]);
		var indicator2 = ((dRightEyebrow2 - dRightEyebrow1) / Math.max(dRightEyebrow1, dRightEyebrow2))  * 15;

		// console.log(indicator2);
		var mx = Math.max(dMouthHorizontal, dMouthVertical, dLeftEyebrow1, dLeftEyebrow2, dRightEyebrow1, dRightEyebrow2);
		// console.log(dMouthHorizontal);
		var x = dMouthVertical * 2 / (1.0 * mx);
		SendMessage("Mouth", "setMouthHeight", x * x * x);
		var mouthWidth = getDistancePoints(positions[3], positions[11]);
		console.log(mouthWidth);
		SendMessage("Mouth", "setMouthWidth", dMouthHorizontal * 2.0 / (1.0 * mouthWidth));
		// console.log(dMouthHorizontal);
		SendMessage("Mouth", "setLeftBrow", indicator1);
		SendMessage("Mouth", "setRightBrow", indicator2);
	}

	

	var cp = ctrack.getCurrentParameters();

	// console.log("huhuhu " , cp);
	
	var er = ec.meanPredict(cp);
	if (er) {
		updateData(er);
		for (var i = 0;i < er.length;i++) {
			if (er[i].value > 0.4) {
				document.getElementById('icon'+(i+1)).style.visibility = 'visible';
			} else {
				document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
			}
		}
	}
}

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();	

/************ d3 code for barchart *****************/

var margin = {top : 20, right : 20, bottom : 10, left : 40},
	width = 400 - margin.left - margin.right,
	height = 100 - margin.top - margin.bottom;

var barWidth = 30;

var formatPercent = d3.format(".0%");

var x = d3.scale.linear()
	.domain([0, ec.getEmotions().length]).range([margin.left, width+margin.left]);

var y = d3.scale.linear()
	.domain([0,1]).range([0, height]);

var svg = d3.select("#emotion_chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)

svg.selectAll("rect").
  data(emotionData).
  enter().
  append("svg:rect").
  attr("x", function(datum, index) { return x(index); }).
  attr("y", function(datum) { return height - y(datum.value); }).
  attr("height", function(datum) { return y(datum.value); }).
  attr("width", barWidth).
  attr("fill", "#2d578b");

svg.selectAll("text.labels").
  data(emotionData).
  enter().
  append("svg:text").
  attr("x", function(datum, index) { return x(index) + barWidth; }).
  attr("y", function(datum) { return height - y(datum.value); }).
  attr("dx", -barWidth/2).
  attr("dy", "1.2em").
  attr("text-anchor", "middle").
  text(function(datum) { return datum.value;}).
  attr("fill", "white").
  attr("class", "labels");

svg.selectAll("text.yAxis").
  data(emotionData).
  enter().append("svg:text").
  attr("x", function(datum, index) { return x(index) + barWidth; }).
  attr("y", height).
  attr("dx", -barWidth/2).
  attr("text-anchor", "middle").
  attr("style", "font-size: 12").
  text(function(datum) { return datum.emotion;}).
  attr("transform", "translate(0, 18)").
  attr("class", "yAxis");


prevE = "";

function updateData(data) {

	var maxE = "";
	var maxx = -1;


	for( var i=0; i<data.length ; i++)
	{
		if(data[i].value > maxx)
		{
			maxx = data[i].value;
			maxE = data[i].emotion;
		}
	}

	if( maxE != prevE)
	{
		prevE = maxE;
		console.log("#emoji5656 " + maxE);
		if(typeof chat!= 'undefined') 
			chat.onSendMessage("#emoji5656 " + maxE);


	}

	
}

/******** stats ********/

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild( stats.domElement );

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
	stats.update();
}, false);



setTimeout( function(){
	startVideo();
} , 3000)
