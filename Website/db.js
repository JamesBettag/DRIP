var mysql = require('mysql')
var pool

exports.connect = function ConnectionHandler(done){
    pool = mysql.createPool({
        host: "leia.cs.spu.edu",
        user: "bettagj",
        password: "Password0*",
        database: "gms"
    });
    done();
}

exports.get = function GetHandler(){
    return pool;
}