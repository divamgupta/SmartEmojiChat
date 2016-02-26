var sentiment = require('sentiment');
getEmotionType = function(message) {
  var result = sentiment(message);
  level = result.score
  // console.log(result);
  if (level <= -3) return "Angry"
  else if (level <= 0 && level > -3) return "Sad"
  else if (0 < level && level < 2) return "Happy"
  else if (level > 2) return "Excited"
  return level;
};
// console.log(getEmotionType('i failed today in nt'));