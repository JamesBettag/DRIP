var mysql = require('mysql')
var con

exports.connect = function ConnectionHandler(done){
    con = mysql.createConnection({
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
