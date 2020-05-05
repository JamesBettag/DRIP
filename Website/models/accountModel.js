var db = require('../db')

exports.insertNewUser = function(fname, lname, email, pass, acchash, done) {
    try{
        db.get().query(
            'INSERT INTO account (first_name, last_name, email, password, account_hash) VALUES (?, ?, ?, ?, ?)', [fname, lname, email, pass, acchash], (err, result) => {
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


exports.getUserEmail = function(email, done) {
    //return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT email FROM account WHERE email = ?', email, (err, result, fields) => {
                if(err) {
                    done(err)
                } else {
                    done(null, result, fields)
                }
            }
        )
    //})
    
}

exports.getUserPasswordHash = function(email, done) {
    //return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT password FROM account WHERE email = ?', email, (err, result, fields) => {
                if(err) {
                    done(err)
                } else {
                    done(null, result, fields)
                }
            }
        )
    //})
    
}

exports.getUserEmailPasswordId = function(email, done) {
    db.get().query(
        'SELECT email, password, account_id FROM account WHERE email = ?', email, (err, result, fields) => {
            if(err) {
                return done(err)
            } else {
                done(null, result, fields)
            }
        }
    )
}

exports.findUserById = function(id, done) {
    db.get().query(
        'SELECT account_id, email, password FROM account WHERE account_id = ?', id, (err, result, fields) => {
            if(err) {
                return done(err)
            } else {
                done(null, result, fields)
            }
        }
    )
}

exports.updateUserVerification = function(hash, done) {
    db.get().query(
        "UPDATE account SET verify = '1' WHERE account_hash = ?", hash, (err, result) => {
            if (err) {
                return done(err)
            }
            done(null, result.affectedRows)
        }
    )
}

//Tad's
exports.insertResetPasswordRequest = function(accid, hash, done){
    try{
        db.get().query(
            'INSERT INTO reset_password (account_id, reset_password_hash) VALUES (?, ?)', [accid, hash], (err, result) => {
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
exports.getAccountId = function(email, done) {
    db.get().query(
        'SELECT account_id FROM account WHERE email = ?', [email],(err, result, fields) => {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}

exports.invalidatePreviousChangePasswordHashes = function(accId, done) {
    db.get().query(
        "UPDATE reset_password SET valid = '0' WHERE account_id = ?", accId, (err, result) => {
            if(err) {
                return done(err)
            }
            done(null, result.affectedRows)
        }
    )
}

exports.checkUserPasswordHash = function(hash, done) {
    db.get().query(
        "SELECT account_id FROM reset_password WHERE valid = '1' AND reset_password_hash = ?", hash, (err, result, fields) => {
            if(err) {
                return done(err)
            }
            done(null, result, fields)
        }
    )
}
