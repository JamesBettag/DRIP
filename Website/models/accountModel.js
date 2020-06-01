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

exports.getUserEmailById = function(accId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT email FROM account WHERE account_id = ?', accId, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result[0].email)
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

exports.getUserName = function(accId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            'SELECT first_name FROM account WHERE account_id = ?', accId, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result[0].first_name)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
}

exports.updateNameById = function(accId, fname, lname) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE account SET first_name = ?, last_name = ? WHERE account_id = ?", [fname, lname, accId], (err, result) => {
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

// TODO: put device queries in their own model
exports.deleteDevice = function(accId, deviceId){
    return new Promise(function(resolve, reject) {
        db.get().query(
            'DELETE FROM device WHERE device_id = ? AND account_id = ?', [deviceId, accId], (err, result) => {
                if(err){
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.renameDevice = function(deviceId, deviceName) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE device SET device_name = ? WHERE device_id = ?", [deviceName, deviceId], (err, result) => {
                if (err) { reject(err) }
                else { resolve(result.affectedRows) }
            }
        )
    })
}

exports.getUserPlants = function(accountId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT plant_name, plant_id, minimum FROM plant WHERE account_id = ?", accountId, (err, result, fields) => {
                if(err) { reject(err) }
                else {
                    if(result.length) { resolve(result) }
                    else { resolve(null) }
                }
            }
        )
    })
}

exports.insertNewPlant = function(accId, plantName, min, max){
    return new Promise(function(resolve, reject) {
        db.get().query(
            "INSERT INTO plant (plant_name, account_id, minimum, maximum) VALUES(?, ?, ?, ?)", [plantName, accId, min, max], (err, result) => {
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

exports.getAccountAndEmailByDevice = function(deviceId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT account.email, device.account_id " +
            "FROM account JOIN device ON device.account_id = account.account_id " +
            "WHERE device.device_id = ?", deviceId, (err, result, fields) => {
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

exports.deletePlantData = function(plantId){
    return new Promise(function(resolve, reject) {
        db.get().query(
            'DELETE FROM data WHERE plant_id = ?', [plantId], (err, result) => {
                if(err){
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.deletePlant = function(accId, plantId){
    return new Promise(function(resolve, reject) {
        db.get().query(
            'DELETE FROM plant WHERE plant_id = ? AND account_id = ?', [plantId, accId], (err, result) => {
                if(err){
                    
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.plantHasDevice = function(plantId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT device_id FROM device WHERE plant_id = ?", [plantId], (err, result, fields) => {
                if (err) { reject(err) }
                else {
                    if (result.length) { resolve(result[0].device_id) }
                    else { resolve(null) }
                }
            }
        )
    })
}

exports.changeDevicePlantToNull = function(deviceId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE device SET plant_id = NULL WHERE device_id = ?", [deviceId], (err, result) => {
                if (err) { reject(err) }
                else { resolve(result.affectedRows) }
            }
        )
    })
}

exports.updatePlantMoisture = function(accId, plantid, min, max) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE plant SET minimum = ?, maximum = ? WHERE plant_id = ? AND account_id = ?", [min, max, plantid, accId], (err, result) => {
                if(err) {
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.renamePlant = function(plantId, plantName) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE plant SET plant_name = ? WHERE plant_id = ?", [plantName, plantId], (err, result) => {
                if (err) { reject(err) }
                else { resolve(result.affectedRows) }
            }
        )
    })
}

exports.getRecentPlantIds = function(accountId, startDate, stopDate) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT DISTINCT(data.plant_id) " +
            "FROM data JOIN plant ON data.plant_id = plant.plant_id " + 
            "WHERE plant.account_id = ? AND data.time BETWEEN ? AND ?", [accountId, startDate, stopDate], (err, result, fields) => {
                if (err) { reject(err) }
                else {
                    if (result.length) { resolve(result) }
                    else { resolve(null) }
                }
            }
        )
    })
}

exports.getNotification = function(accountId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT notification FROM account WHERE account_id = ?", [accountId], (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result[0].notification)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
}

exports.updateNotificationById = function (accountId, notify) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "UPDATE account SET notification = ? WHERE account_id = ?", [notify, accountId], (err, result) => {
                if(err) {
                    reject(false)
                } else {
                    resolve(true)
                }
            }
        )
    })
}

exports.getUserEmailByAccountId = function (accountId) {
    return new Promise(function (resolve, reject) {
        db.get().query(
            "SELECT email FROM account WHERE account_id = ?", accountId, (err, result, fields) => {
                if (err) { reject(err) }
                else {
                    if (result.length) { resolve(result[0].email) }
                    else { resolve(null) }
                }
            }
        )
    })
}

exports.checkExistingDevice = function(deviceId) {
    return new Promise(function (resolve, reject) {
        db.get().query(
            "SELECT device_id FROM device WHERE device_id = ?", deviceId, (err, result, fields) => {
                if (err) { reject(err) }
                else {
                    if (result.length) { resolve(true) }
                    else { resolve(false) }
                }
            }
        )
    })
}