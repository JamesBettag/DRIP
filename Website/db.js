var mysql = require('mysql')
var con

exports.connect = function ConnectionHandler(done){
    con = mysql.createConnection({
        connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: "leia.cs.spu.edu",
        user: "gms",
        password: "Password1*",
        database: "gms"
    });
    done();
}

exports.get = function GetHandler(){
    return con;
}
