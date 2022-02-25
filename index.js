//express, mongoose, ejs, body parser 초기화
﻿var express = require('express');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var tCounter = 0;
var multer = require('multer');
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

//DB셋팅
dburl = "mongodb+srv://ThatNameUser:ThatNamePassword@thatnamedb.wt7qc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
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

var quizSchema = mongoose.Schema({
  Pid : {type:Number, required:true, unique:true},
  answer : {type:Array},
  comment : {type:String},
  ext : {type:String}
});
var Quiz = mongoose.model('quiz', quizSchema);
var tCounter = 0;
Quiz.countDocuments({}, function (err, count) {
    if (err){
        console.log(err);
    }else{
        tCounter = count;
    }
});

//CONTENT
//content를 루트로
app.get('/', function(req, res){
  res.redirect('/content');
});

//content로 get 시에 index.ejs(메인페이지)
app.get('/content', function(req, res){
  res.render('content/index');
});

//quiz_page로 get 시에 quiz_page.ejs
app.get('/content/quiz_page', function(req, res){
  res.render('content/quiz_page');
});

//ADMIN
//quiz_list로 Get 시에
app.get('/admin/quiz_list', function(req, res){
  Quiz.find({}, function(err, quiz){
    if(err) return res.json(err);
    res.render('admin/quiz_list', {quiz_key:quiz});
  });
});

// quiz_list로 Post 시에
app.post('/admin/quiz_list', upload.single('image'), function(req, res){
  req.body.Pid = tCounter;
  req.body.answer = ((String)(req.body.answer)).split(",");
  ext = ((String)(req.file.originalname)).split(".");
  req.body.ext = ext[ext.length - 1];

  console.log(req.body);
  Quiz.create(req.body, function(err, quiz){
    if(err) return res.json(err);
  });
  res.render('admin/quiz_list');
});

//quiz_add로 Get 시에
app.get('/admin/quiz_add', function(req, res){
  res.render('admin/quiz_add');
});

var port = 3000; // 사용할 포트 번호를 port 변수에 넣습니다.
app.listen(port, function(){ // port변수를 이용하여 3000번 포트에 node.js 서버를 연결합니다.
  console.log('server on! http://localhost:'+port); //서버가 실행되면 콘솔창에 표시될 메세지입니다.
});
