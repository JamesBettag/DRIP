var db = require('../db')

exports.insertNewUser = function InserNewUserHandler(fname, lname, email, pass, acchash, done) {
    try{
        db.get().query(
            'INSERT INTO account (first_name, last_name, email, password, account_hash) VALUES (?, ?, ?, ?, ?)', [fname, lname, email, pass, acchash], function InserNewUserQueryHandler(err, result) {
                if(err) {
                    return done(err)
                }
                done(null, true)
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

exports.updateUserVerification = function UpdateUserVerificationHandler(hash, done) {
    db.get().query(
        "UPDATE account SET verify = '1' WHERE account_hash = ?", hash, function UpdateUserVerificationQueryHandler(err, result) {
            if (err) {
                return done(err)
            }
            done(null, result.affectedRows)
        }
    )
}

//Tad's
exports.insertResetPasswordRequest = function InsertResetPasswordHandler(accid, hash, done){
    try{
        db.get().query(
            'INSERT INTO reset_password (account_id, reset_password_hash) VALUES (?, ?)', [accid, hash], function InserNewResetPasswordQueryHandler(err, result) {
                if(err) {
                    return done(err)
                }
                done(null, true)
            }
        )
    }
    catch(err) {
        console.log(err)
    }    
}

//Tad's
exports.getAccountId = function GetAccountIdHandler(email, done) {
    db.get().query(
        'SELECT account_id FROM account WHERE email = ?', [email], function GetAccountIdQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}