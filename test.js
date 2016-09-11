var moment = require('moment');
console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
console.log(moment().format());
const MySQLConnection = require('./mysql-connection');

var conn = new MySQLConnection();
conn.update('goods', {price: 25.30 }, {id: 1 }).then(rows => {
	console.log('update', rows);
}, err => {
	console.log(err);
});
//
//conn.fetchAll(`select * from goods where 1=1 limit 2`).then(rows => {
//    conn.fetchRow(`select count(*) from goods limit 10`).then(rows => {
//    });
//    conn.fetchOne(`select count(*) from goods limit 1`).then(rows => {
//
//        conn.insert('goods', {
//          title: 'test title',
//          url: 'http://item.jd.com/1123124.html',
//          price: 23.12,
//          low_price: 23.12,
//          created_time: '2016-9-12 11:11:11',
//          come_in: 'jd'
//        }).then(goodsId => {
//          console.log('goods id', goodsId);
//          
//          conn.insert('price_history', {
//            goods_id: goodsId,
//            price: 111.1,
//            created_time: '2016-2-3 22:22:22'
//          }).then(id => {
//            conn.update('price_history', {
//              price: 222.20
//            }, {id: 3}).then(rows => {
//              //console.log(rows);
//            }, err => {
//              console.log(err);
//            });
//            conn.fetchAll(`select * from price_history limit 1`).then(rows => {
//              //console.log(rows);
//            }, err => {
//              console.log(err);
//            })
//          }, err => {
//            console.log(err);
//          })
//        }, err => {
//          console.log(err);
//        })
//
//    });
//}, err => {
//    console.log(err);
//})
