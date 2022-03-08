var express = require('express');
var app = express();
var Quiz = require('../models/Quiz');

var User = require('../models/User');

var passport = require('../config/passport');

let tCounter = 0;
Quiz.countDocuments({}, function (err, count){
  if (err){
      console.log(err);
  }else{
      tCounter = count;
  }
});

app.get('/', function(req, res){
  res.redirect('/quiz/quiz_page');
});

//랜덤 quiz_page
app.get('/quiz_page', function(req, res){
  randPid = Math.floor(Math.random() * tCounter);
  Quiz.findOne({Pid:randPid}, function(err, quiz){
    if(err) return res.json(err);
    res.render('content/quiz_page', {quiz_key:quiz});
  });
});

//정해진 quiz_page
app.get('/quiz_page/:Pid', function(req, res){
  Quiz.findOne({Pid:req.params.Pid}, function(err, quiz){
    if(err) return res.json(err);
    res.render('content/quiz_page', {quiz_key:quiz});
  });
});

// quiz_page로 Post 시에
app.post('/', function(req, res){
  let answer_list = [];
  var quiz_id = req.body.Pid;
  var input_answer = req.body.answer; input_answer = input_answer.replace(/ /gi, "");

  Quiz.findOne({Pid:quiz_id}, function(err, quiz){
    if(err) return res.json(err);
    if(scoring(quiz.answer, input_answer)){
      res.redirect('/quiz/quiz_correct/'+quiz_id);
    }
    else{
      res.redirect('/quiz/quiz_incorrect/'+quiz_id);
    }
  });
});

//정답페이지
app.get('/quiz_correct/:Pid', function(req, res){
  if(req.isAuthenticated()){
    User.findOneAndUpdate({ user_id: req.user.user_id }, { $addToSet: { solved: req.params.Pid} }, function(err, users){
      if(err) return res.json(err);
    });
  }
  res.render('content/quiz_correct');
});

//오답페이지
app.get('/quiz_incorrect/:Pid', function(req, res){
  res.render('content/quiz_incorrect', {Pid:req.params.Pid});
});

//채점 함수
function scoring(answer_list, input_answer){
  let checker = false;
  answer_list.forEach(function(correct_answer){
    correct_answer = correct_answer.replace(/ /gi, "");
    if(correct_answer === input_answer){
      checker = true;
      return;
    }
  });
  return checker;
}

module.exports = app;
