var mongoose = require('mongoose');

var quizSchema = mongoose.Schema({
  Pid : {type:Number, required:true, unique:true},
  answer : {type:Array},
  comment : {type:String},
  ext : {type:String}
});

var Quiz = mongoose.model('quiz', quizSchema);
module.exports = Quiz;
