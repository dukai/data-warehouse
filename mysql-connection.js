"use strict"
const mysql = require('mysql');

var MySQLConnection = function(){
  this.config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'luluo_db'
  };
};


MySQLConnection.prototype = {
  query(sql){
    this.conn = mysql.createConnection(this.config);
    return new Promise((resolve, reject) => {
      this.conn.connect()
      this.conn.query(sql, function(err, rows, filed){
        if(err){
          reject(err);
        }else{
          resolve(rows, filed);
        }
      });
    });
  },

  fetchAll(sql){
    var result = this.query(sql);
    this.conn.end();
    return result;
  },

  fetchOne(sql){
    return new Promise((resolve, reject) => {
      this.fetchRow(sql).then((rows, filed) => {
        let result = null; 

        if(rows != null){
          for(var key in rows){
            result = rows[key]
            resolve(result);
            return;
          }
        }

        resolve(result);
      }, err => {
        reject(err);
      })
    })
  },

  fetchRow(sql){
    return new Promise((resolve, reject) => {

      if(!/limit/.test(sql)){
        sql = sql + ' limit 1';
      }

      this.fetchAll(sql).then((rows, filed) => {
        resolve(rows.length > 0 ? rows[0]: null, filed);
      }, err => {
        reject(err);
      })
    })
  },

  insert(table, fileds){
    let keyList = [];
    let valueList = [];
    let keyListString, valueListString;
    for(let key in fileds){
      keyList.push(key);
      valueList.push(fileds[key]);
    }

    keyListString = keyList.join(",");
    valueListString = valueList.join("','");

    var sql = `insert into ${table} (${keyListString}) values ('${valueListString}')`;

    return new Promise((resolve, reject) => {
      this.query(sql).then((rows, filed) => {

        resolve(rows.insertId);

      }, err => {
        reject(err);
      })
      this.conn.end();
    });
  },

  update(table, fileds, where){
    if(typeof where === "undefined"){
      where = [
        "1=1"
      ];
    }

    if(typeof where === 'object'){
      if(where instanceof Array){
        
      }else{
        let l = [];
        for(let key in where){
          l.push(`${key}='${where[key]}'`);
        }
        l.push("1=1");
        where = l;
      }
    }

    let whereString = where.join(" and ");

    let keyList = [];
    let valueList = [];
    let keyListString, valueListString;
    for(let key in fileds){
      keyList.push(key);
      valueList.push(`${key}='${fileds[key]}'`);
    }

    valueListString = valueList.join(",");

    var sql = `update ${table} set ${valueListString} where ${whereString}`;

    var result = this.query(sql);
    this.conn.end();
    return result;
  },
  end(){
    this.conn.end()
  }
}


module.exports = MySQLConnection;
