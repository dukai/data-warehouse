"use strict"
const crypto = require('crypto');
const Segment = require('segment');
var segment = new Segment();
segment.useDefault();

const express = require('express');
var app = express();
const bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
const PORT = 8090;
const Template = require('template');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'luluo_db'
});
connection.connect();
var fs = require('fs'); // this engine requires the fs module
const redis = require("redis"),
    client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
app.engine('html', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var t = new Template(content.toString());
    var rendered = t.render(options);
    return callback(null, rendered);
  });
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'html'); // register the template engine

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search', (req, res) => {
  var keywords = req.query.s;
  var result = segment.doSegment(keywords, {
    stripStopword: true,
    simple: true,
    stripPunctuation: true
  });
  result = result.map(val => {
    let md5 = crypto.createHash('md5');
    md5.update(val);
    val = md5.digest('hex');
    return `w:${val}`
  })

  client.sinter(result, (err, replies) => {
    connection.query('select * from goods where id in (' + replies.join(',') + ') limit 10', (err, rows) => {
      res.render('search', {
        list: rows,
        s: keywords
      })
    });
  })
});



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

app.listen(PORT, function(){
  console.log(`start server on port ${PORT}`);
})
