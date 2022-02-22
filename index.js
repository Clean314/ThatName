//express, mongoose, ejs, body parser 초기화
﻿var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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

//static 경로 설정
app.use(express.static(__dirname + '/public'));

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

var port = 3000; // 사용할 포트 번호를 port 변수에 넣습니다.
app.listen(port, function(){ // port변수를 이용하여 3000번 포트에 node.js 서버를 연결합니다.
  console.log('server on! http://localhost:'+port); //서버가 실행되면 콘솔창에 표시될 메세지입니다.
});
