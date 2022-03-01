//express, mongoose, ejs, body parser 초기화
﻿var express = require('express');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();
var router = express.Router();

var multer = require('multer');

//DB셋팅
dburl = "mongodb+srv://ThatNameUser:dswnrf6boIbUigrB@thatnamedb.lgctr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(dburl);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use('/users', require('./routes/users'));

var quizSchema = mongoose.Schema({
  Pid : {type:Number, required:true, unique:true},
  answer : {type:Array},
  comment : {type:String},
  ext : {type:String}
});
var Quiz = mongoose.model('quiz', quizSchema);
let tCounter = 0;
Quiz.countDocuments({}, function (err, count){
  if (err){
      console.log(err);
  }else{
      tCounter = count;
  }
});

//새로 추가
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/quiz_image/');
    },
    filename: function (req, file, cb) {
      ext = (file.originalname).split(".");
      cb(null, tCounter + "." + ext[ext.length - 1]);
    }
  })
});

//사진 수정
let update_Pid = 0;
var update = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/quiz_image/');
    },
    filename: function (req, file, cb) {
      ext = (file.originalname).split(".");
      cb(null, update_Pid + "." + ext[ext.length - 1]);
    }
  })
});

//CONTENT
//content를 루트로
app.get('/', function(req, res){
  res.redirect('/content');
});

//content로 get 시에 index.ejs(메인페이지)
app.get('/content', function(req, res){
  res.render('content/index', {tCounter:tCounter});
});

//랭킹페이지
app.get('/ranking', function(req, res){
  res.render('content/ranking');
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
// quiz_page로 Post 시에
app.post('/quiz_page', function(req, res){
  let answer_list = [];
  var quiz_id = req.body.Pid;
  var input_answer = req.body.answer; input_answer = input_answer.replace(/ /gi, "");

  Quiz.findOne({Pid:quiz_id}, function(err, quiz){
    if(err) return res.json(err);
    if(scoring(quiz.answer, input_answer)){
      res.redirect('/quiz_correct');
    }
    else{
      res.redirect('/quiz_incorrect/'+quiz_id);
    }
  });
});

//정답페이지
app.get('/quiz_correct', function(req, res){
  res.render('content/quiz_correct');
});

//오답페이지
app.get('/quiz_incorrect/:Pid', function(req, res){
  res.render('content/quiz_incorrect', {Pid:req.params.Pid});
});

//ADMIN
//quiz_list로 Get 시에
app.get('/admin/quiz_list', function(req, res){
  Quiz.find({}, function(err, quiz){
    if(err) return res.json(err);
    res.render('admin/quiz_list', {quiz_key:quiz});
  });
});

//quiz_add로 Get 시에
app.get('/admin/quiz_add', function(req, res){
  res.render('admin/quiz_add');
});

// quiz_list로 Post 시에
app.post('/admin/quiz_list', upload.single('image'), function(req, res){
  req.body.Pid = tCounter;
  var arr = (req.body.answer).split(",");
  req.body.answer = arr;
  var ext = ((String)(req.file.originalname)).split(".");
  req.body.ext = ext[ext.length - 1];

  Quiz.create(req.body, function(err, quiz){
    if(err) return res.json(err);
    res.redirect('quiz_list');
  });
  tCounter += 1;
});

//퀴즈 보기/수정/삭제
//:Pid 로 Get 시에
app.get('/admin/quiz_list/:Pid', function(req, res){
  Quiz.findOne({Pid:req.params.Pid}, function(err, quiz){
    if(err) return res.json(err);
    res.render('admin/quiz_show', {quiz_key:quiz});
  });
});

//:Pid/edit 로 Get 시에
app.get('/admin/quiz_edit/:Pid', function(req, res){
  update_Pid = req.params.Pid;
  Quiz.findOne({Pid:req.params.Pid}, function(err, quiz){
    if(err) return res.json(err);
    res.render('admin/quiz_edit', {quiz_key:quiz});
  });
});

//:Pid 로 Put(Update) 시에
app.put('/admin/:Pid', update.single('image'), function(req, res){
  var arr = (req.body.answer).split(",");
  req.body.answer = arr;
  Quiz.findOneAndUpdate({Pid:req.params.Pid}, req.body, function(err, contact){
    if(err) return res.json(err);
    res.redirect('quiz_list/'+req.params.Pid);
  });
});

//:Pid 로 Delete 시에
app.delete('/admin/:Pid', function(req, res){
  Quiz.deleteOne({Pid:req.params.Pid}, function(err){
    if(err) return res.json(err);
    res.redirect('admin/quiz_list');
  });
});

var port = 3000; // 사용할 포트 번호를 port 변수에 넣습니다.
app.listen(port, function(){ // port변수를 이용하여 3000번 포트에 node.js 서버를 연결합니다.
  console.log('server on! http://localhost:'+port); //서버가 실행되면 콘솔창에 표시될 메세지입니다.
});
