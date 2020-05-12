const db = require('../config/db')

exports.insertResetPasswordRequest = function(accid, hash){
    return new Promise(function(resolve, reject) {
        db.get().query(
            'INSERT INTO reset_password (account_id, reset_password_hash) VALUES (?, ?)', [accid, hash], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result.affectedRows)
                }
            }
        )
    })  
}

exports.invalidatePreviousChangePasswordHashes = function(accId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE reset_password SET valid = '0' WHERE account_id = ?", accId, (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result.affectedRows)
                }
            }
        )
    })
}

exports.checkUserPasswordHash = function(hash) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT account_id FROM reset_password WHERE valid = '1' AND reset_password_hash = ?", hash, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result[0].account_id)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
}