var db = require('../db')

exports.insertNewUser = function InserNewUserHandler(fname, lname, email, pass, acchash, done) {
    try{
        db.get().query(
            'INSERT INTO account (first_name, last_name, email, password, account_hash) VALUES (?, ?, ?, ?, ?)', [fname, lname, email, pass, acchash], function InserNewUserQueryHandler(err, result) {
                if(err) {
                    return done(err)
                }
                done(null, result.insertId)
            }
        )
    }
    catch(err) {
        console.log(err)
    }    
}

exports.getUserEmail = function GetUserEmailHandler(email, done) {
    db.get().query(
        'SELECT first_name FROM account WHERE email = ?', email, function GetUserEmailQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}