const db = require('../config/db')

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

exports.getUserEmail = function(email) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT email FROM account WHERE email = ?', email, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }
        )
    })
    
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
        'SELECT email, password, account_id, verify FROM account WHERE email = ?', email, (err, result, fields) => {
            if(err) {
                return done(err)
            } else {
                done(null, result, fields)
            }
        }
    )
}

exports.getAccountInfoByID = function(accId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT account_id, email, password FROM account WHERE account_id = ?', accId, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
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
exports.getAccountId = function(email) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT account_id FROM account WHERE email = ?', [email],(err, result, fields) => {
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

exports.updatePasswordById = function(accId, password) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE account SET password = ? WHERE account_id = ?", [password, accId], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result.affectedRows)
                }
            }
        )
    })
}

exports.updateActivePlant = function(plantID, deviceID) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE device SET plant_id = ? WHERE device_id = ?", [plantID, deviceID], (err, result) => {
                if (err) {
                    reject(err)
                }else{
                    resolve(result.affectedRows)
                }
            }
        )
    })
}

exports.updateNameAndPasswordById = function(accId, fname, lname, password) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE account SET first_name = ?, last_name = ?, password = ? WHERE account_id = ?", [fname, lname, password, accId], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result.affectedRows)
                }
            }
        )
    })
}

exports.insertNewDevice = function(accId, deviceId, deviceName){
    return new Promise(function(resolve, reject) {
        db.get().query(
            "INSERT INTO device (device_id, device_name, account_id) VALUES(?, ?, ?)", [deviceId, deviceName, accId], (err, result) => {
                if(err){
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.deleteDevice = function(accId, deviceId){
    return new Promise(function(resolve, reject) {
        db.get().query(
            //DELETE FROM device WHERE device_id='123' AND account_id='3' 
            'DELETE FROM device WHERE device_id = ? AND account_id = ?', deviceId, accId, (err, result) => {
                if(err){
                    console.log(err)
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}