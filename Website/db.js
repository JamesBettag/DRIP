var mysql = require('mysql')
var con

exports.connect = function ConnectionHandler(done){
    con = mysql.createConnection({
        host: "localhost",
        user: "bettagj",
        password: "Password0*",
        database: "gms"
    });
    done();
}

exports.get = function GetHandler(){
    return con;
}
