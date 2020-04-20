var mysql = require('mysql')
var pool

exports.connect = function ConnectionHandler(done){
    pool = mysql.createPool({
        connectionLimit : 1000,
        connectTimeout  : 60 * 60 * 1000,
        acquireTimeout  : 60 * 60 * 1000,
        timeout         : 60 * 60 * 1000,
        host: "localhost",
        user: "bettagj",
        password: "Password0*",
        database: "gms"
    });
    done();
}

exports.get = function GetHandler(){
    return pool;
}
