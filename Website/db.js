/*
const mysqlx = require('@mysql/xdevapi')

mysqlx
    .getSession('mysqlx://bettagj:Password0*@leia.cs.spu.edu:33060/gms')
    .then(session=> {
        console.log(session.inspect())
    })
*/

var mysql = require('mysql')
var pool

exports.connect = function ConnectionHandler(done){
    pool = mysql.createPool({
        connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: "leia.cs.spu.edu",
        user: "bettagj",
        password: "Password0*",
        database: "gms",
        insecureAuth: true
    });
    done();
}

exports.get = function GetHandler(){
    return pool;
}