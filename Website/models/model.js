var db = require('../db')

exports.insertNewUser = function InserNewUserHandler(fname, lname, email, pass, done) {
    try{
        db.get().query(
            'INSERT INTO account (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [fname, lname, email, pass], function InserNewUserQueryHandler(err, result) {
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
        'SELECT email FROM account WHERE email = ?', email, function GetUserEmailQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            }
            
            if(!result.length) {
                done(null, null, fields)
            } else {
                done(null, result, fields)
            }
        }
    )
}

exports.getUserPasswordHash = function GetUserPasswordHashHandler(email, done) {
    db.get().query(
        'SELECT password FROM account WHERE email = ?', email, function GetUserPasswordHashQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}
