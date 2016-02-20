var chat = {


	recivedMsgs: {},
	curSelectedChat: '',
	thisUserId : "testtest" , 


	init: function() {
		this.cacheDOM();
		this.bindEvents();
   	},
	cacheDOM: function() {
		this.$chatHistory = $('.chat-history');
		this.$button = $('button');
		this.$textarea = $('#message-to-send');
		this.$chatHistoryList = this.$chatHistory.find('ul');
	},
	bindEvents: function() {
		this.$button.on('click', this.onSendMessage.bind(this));
		this.$textarea.on('keyup', this.addMessageEnter.bind(this));
	},

	addMsgInUI: function(msg) {
		var template;
		if (msg.recieved)
			template = Handlebars.compile($("#message-response-template").html());
		else
			template = Handlebars.compile($("#message-template").html());

		this.$chatHistoryList.append(template(msg));
		this.scrollToBottom();

		// chat.addMsgInUI({text:"jjjjjj" , name:"jjihb  uy" , time: new Date(), recieved:8 })
	},

	newMsgRecived(msg) {
		//  { chatId : from_user  , senderId :  from_user , msg : msg ,  time : (new Date()).getTime()  }  

		if (!(this.recivedMsgs[chatId]))
			this.recivedMsgs[chatId] = [];

		var x = {text:msg.msg , name:msg.senderId , time: msg.time , recieved:true } ;

		this.recivedMsgs[chatId].push( x);

		if(this.curSelectedChat ==  msg.chatId )
			addMsgInUI(x);

	},

	clearArea : function(){
		this.$chatHistoryList.html("");
	},

	rerenderSelected : function(){
		if(!( this.recivedMsgs[this.curSelectedChat] ))
			return;

		this.clearArea();

		for(var i=0; i< this.recivedMsgs[this.curSelectedChat].length ; i++ )
		{
			this.addMsgInUI(this.recivedMsgs[this.curSelectedChat][i]);
		}

		this.scrollToBottom();
	},

	onSendMessage: function() {

		if(!( this.recivedMsgs[this.curSelectedChat] ))
			return;

		var messageToSend = this.$textarea.val();

		var x = {text: messageToSend , name: this.thisUserId , time: this.getCurrentTime() , recieved:false } ;
		this.recivedMsgs[this.curSelectedChat] .push(x);

		this.addMsgInUI(x);

		this.$textarea.val('');

	},
	addMessageEnter: function(event) {
		// enter was pressed
		if (event.keyCode === 13) {
		  this.onSendMessage();
		}
	}, 

	selectChat : function(chadId){
		this.curSelectedChat = chadId;

		if(!( this.recivedMsgs[this.curSelectedChat] ))
			this.recivedMsgs[this.curSelectedChat]  = [];
		this.rerenderSelected();

	},

	scrollToBottom: function() {
		this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
	},
	getCurrentTime: function() {
		return new Date().toLocaleTimeString().
		replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
	},
	getRandomItem: function(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

};

chat.init();

chat.selectChat('testtest');

var searchFilter = {
	options: { valueNames: ['name'] },
	init: function() {
		var userList = new List('people-list', this.options);
		var noItems = $('<li id="no-items-found">No items found</li>');

		userList.on('updated', function(list) {
			if (list.matchingItems.length === 0) {
				$(list.list).append(noItems);
			} else {
				noItems.detach();
			}
		});
	}
};

searchFilter.init();
