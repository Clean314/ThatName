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



//--------UNSOLVED----------
//Unsolved 모드
app.get('/unsolved', function(req, res){
  let list = [];

  if(req.isAuthenticated()){
    User.findOne({ user_id: req.user.user_id }, function(err, users){
      if(err) return res.json(err);
      this.list = users.solved;
    });

    if (list.length >= tCounter) {
      res.render('content/completed');
    }

    var randPid = unsolved_Pid(list);
    Quiz.findOne({Pid:randPid}, function(err, quiz){
      if(err) return res.json(err);
      res.render('content/unsolved_quiz_page', {quiz_key:quiz});
    });
  }
});

//정해진 Unsolved
app.get('/unsolved_quiz_page/:Pid', function(req, res){
  Quiz.findOne({Pid:req.params.Pid}, function(err, quiz){
    if(err) return res.json(err);
    res.render('content/unsolved_quiz_page', {quiz_key:quiz});
  });
});

//Unsolved quiz_page로 Post 시에
app.post('/unsolved', function(req, res){
  let answer_list = [];
  var quiz_id = req.body.Pid;
  var input_answer = req.body.answer; input_answer = input_answer.replace(/ /gi, "");

  Quiz.findOne({Pid:quiz_id}, function(err, quiz){
    if(err) return res.json(err);
    if(scoring(quiz.answer, input_answer)){
      res.redirect('/quiz/unsolved_quiz_correct/'+quiz_id);
    }
    else{
      res.redirect('/quiz/unsolved_quiz_incorrect/'+quiz_id);
    }
  });
});

//Unsolved 정답페이지
app.get('/unsolved_quiz_correct/:Pid', function(req, res){
  if(req.isAuthenticated()){
    User.findOneAndUpdate({ user_id: req.user.user_id }, { $addToSet: { solved: req.params.Pid} }, function(err, users){
      if(err) return res.json(err);
    });
  }
  res.render('content/unsolved_quiz_correct');
});

//Unsolved 오답페이지
app.get('/unsolved_quiz_incorrect/:Pid', function(req, res){
  res.render('content/unsolved_quiz_incorrect', {Pid:req.params.Pid});
});


//채점 함수 (공통)
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

//Unsolved용 : 안 푼 문제 중 랜덤 Pid 리턴 함수
function unsolved_Pid(list){
  while(true) {
    var randPid = Math.floor(Math.random() * tCounter);
    if(list.find(element => element == randPid) == undefined) {
      return randPid;
    }
  }
}

module.exports = app;
