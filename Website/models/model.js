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
            //console.log("SQL: ")
            //console.log(result)
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

exports.invalidatePreviousChangePasswordHashes = function invalidatePreviousChangePasswordHashesHandler(accId, done) {
    db.get().query(
        "UPDATE reset_password SET valid = '0' WHERE account_id = ?", accId, function InvalidatePreviousChangePasswordHashesQueryHandler(err, result) {
            if(err) {
                return done(err)
            }
            done(null, result.affectedRows)
        }
    )
}

exports.checkUserPasswordHash = function checkUserPasswordHashHandler(hash, done) {
    db.get().query(
        "SELECT account_id FROM reset_password WHERE valid = '1' AND reset_password_hash = ?", hash, function CheckUserPasswordHashQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}
