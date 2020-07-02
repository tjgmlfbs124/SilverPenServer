var express 	= require('express');
var app 		= express();
var bodyParser 	= require('body-parser');
var dbconfig 	= require('./config/database.js');
var mysql 		= require('mysql');
var cors = require('cors'); // 'cors' 크롬 확장프로그램 모듈. localhost 보안규칙을 해결해줌

var connection = mysql.createConnection(dbconfig);

// app.use(express.static(__dirname + '/public/vendor'));
// app.use(express.static(__dirname + '/public/assets'));
// app.use(express.static(__dirname + '/public/js'));



app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cors({origin: 'http://localhost:3000'}));

var server = app.listen(3000, function(){
  connection.connect();
  console.log("Express server has started on port 3000")
});

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var router = require('./router/main')(app, connection);
