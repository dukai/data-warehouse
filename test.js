const MySQLConnection = require('./mysql-connection');

var conn = new MySQLConnection();

conn.fetchAll(`select * from goods where 1=1 limit 2`).then(rows => {
    console.log(rows);
    conn.fetchRow(`select count(*) from goods limit 10`).then(rows => {
        console.log(rows);
    });
    conn.fetchOne(`select count(*) from goods limit 1`).then(rows => {
        console.log(rows);

        conn.insert('price_history', {
            goods_id: 1,
            price: 111.1,
            created_time: '2016-2-3 22:22:22'
        }).then(id => {
            console.log(id);
        }, err => {
            console.log(err);
        })
    });
}, err => {
    console.log(err);
})