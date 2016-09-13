"use strict"
const crypto = require('crypto');
const Segment = require('segment');
const moment = require('moment');
const MySQLConnection = require('./mysql-connection');
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


var conn = new MySQLConnection();

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
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.listen(PORT, function(){
  console.log(`start server on port ${PORT}`);
})

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
    console.log(err, replies);
    if(err || replies.length == 0){
      res.render('search', {
        list: [],
        s: keywords
      });

      return;
    }
    conn.fetchAll('select * from goods where id in (' + replies.join(',') + ') limit 10').then((err, rows) => {
      res.render('search', {
        list: rows,
        s: keywords
      })
    });
  })
});




app.get('/add', (req, res) => {
  res.send({
    code: 0,
    message: ''
  })
});

app.post('/add', upload.array(), (req, res, next) => {
  //console.log(req.body.result);
  //connection.connect();

  req.body.result.forEach((data, index) => {
    let now = moment().format("YYYY-MM-DD HH:mm:ss");
    conn.fetchRow(`select * from goods where url='${data.href}'`).then(row => {
      if(row){
        data.price = parseFloat(data.price);
        let oldPrice = row.low_price;
        let lowPrice = data.price < oldPrice ? data.price : oldPrice;
        let highPrice = data.price > oldPrice ? data.price : oldPrice;
        var trend = 0;
        if(data.price < oldPrice){
          trend = -1;
        }else if(data.price > oldPrice){
          trend = 1;
        }

        // console.log('begin update');
        conn.update('goods', {
          title: data.title, price: data.price, 
          low_price: lowPrice, 
          high_price: highPrice, 
          updated_time: now,
          trend: trend
        }, {
          id: row.id
        }).then(rows => {
          // console.log('update', row.id);
          conn.insert('price_history', {
            goods_id:row.id,
            price: data.price,
            created_time: now
          }).then(id => { }, err => console.log(err));
        }, err => console.log(err));
      }else{
        conn.insert('goods', {
          title: data.title, 
          url: data.href, 
          price: data.price, 
          high_price: data.price, 
          low_price: data.price, 
          created_time: now, come_in: 'jd', trend: '0'
        }).then(goodsId => {
          conn.insert('price_history', {
            goods_id:goodsId,
            price: data.price,
            created_time: now
          }).then(id => { }, err => console.log(err));
        }, err => console.log(err));
      }

    })
  })

  res.send({
    code: 0,
    message: ''
  })
});

