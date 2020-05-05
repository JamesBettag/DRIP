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

<<<<<<< HEAD

exports.getUserEmail = function GetUserEmailHandler(email, done) {
    //return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT email FROM account WHERE email = ?', email, function GetUserEmailQueryHandler(err, result, fields) {
                if(err) {
                    done(err)
                } else {
                    done(null, result, fields)
                }
            }
        )
    //})
    
}

exports.getUserPasswordHash = function GetUserPasswordHashHandler(email, done) {
    //return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT password FROM account WHERE email = ?', email, function GetUserPasswordHashQueryHandler(err, result, fields) {
                if(err) {
                    done(err)
                } else {
                    done(null, result, fields)
                }
            }
        )
    //})
    
}

exports.getUserEmailPasswordId = function GetUserEmailAndPassHandler(email, done) {
=======
exports.getUserEmail = function GetUserEmailHandler(email, done) {
>>>>>>> master
    db.get().query(
        'SELECT email, password, account_id FROM account WHERE email = ?', email, function GetUserEmailAndPassQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
<<<<<<< HEAD
=======
            }
            if(!result.length) {
                done(null, null, fields)
>>>>>>> master
            } else {
                done(null, result, fields)
            }
        }
    )
}

<<<<<<< HEAD
exports.findUserById = function findByIdHandler(id, done) {
=======
exports.getUserPasswordHash = function GetUserPasswordHashHandler(email, done) {
>>>>>>> master
    db.get().query(
        'SELECT account_id, email, password FROM account WHERE account_id = ?', id, function findUserByIdQueryHandler(err, result, fields) {
            if(err) {
                return done(err)
            } else {
                done(null, result, fields)
            }
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
