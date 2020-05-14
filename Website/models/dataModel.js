const db = require('../config/db')

exports.getGraphData = function(email, startDate, stopDate) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT plant.minimum, plant.maximum, data.moisture, data.time, plant.plant_name " +
            "FROM data, plant, device, account " + 
            "WHERE (data.plant_id = plant.plant_id) AND (plant.account_id = account.account_id) AND (account.email = ?) AND (data.time) BETWEEN ? AND ?", [email, startDate, stopDate], (err, result, fields) => {
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

exports.getPlantID = function(mac) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT plant_id FROM device WHERE device_id = ?", mac, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result[0].plant_id)
                    } else {
			console.log("no plant found")
                        resolve(null)
                    }
                }
            }
        )
    })
}

exports.insertMoistureData = function(plantId, moisture) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "INSERT INTO data (plant_id, moisture) VALUES (?, ?)", [plantId, moisture], (err, result) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }
        )
    })
}

exports.getDeviceID = function(mac) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT device_id FROM device WHERE device_id = ?", mac, (err, result, fields) => {
                if(err) {
                    reject(err)
                } else {
                    if(result.length) {
                        resolve(result.device_id)
                    } else {
                        resolve(null)
                    }
                }
            }
        )
    })
}

exports.getUserPlants = function(accountId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT plant_name, plant_id FROM plant WHERE account_id = ?", accountId, (err, result, fields) => {
                if(err) { reject(err) }
                else {
                    if(result.length) { resolve(result) }
                    else { resolve(null) }
                }
            }
        )
    })
}

exports.getUserDevices = function(accountId) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT device_name, device_id FROM device WHERE account_id = ?", accountId, (err, result, fields) => {
                if(err) { reject(err) }
                else {
                    if(result.length) { resolve(result) }
                    else { resolve(null) }
                }
            }
        )
    })
}
