var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'luluo_db'
});
connection.connect();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/add', (req, res) => {
  res.send({
    code: 0,
    message: ''
  })
});

app.post('/add', upload.array(), (req, res, next) => {
  for(var data of req.body.result){
    connection.query(`insert into goods (title, url, price) values ('${data.title}', '${data.href}', '${data.price}')`, (err, rows, fields) => {
    });
  }
  res.send({
    code: 0,
    message: ''
  })
});

app.listen(8090, function(){
  console.log(`start server on port 3000`);
})
