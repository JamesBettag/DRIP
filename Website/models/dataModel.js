const db = require('../config/db')

exports.getGraphData = function(email, startDate, stopDate) {
    return new Promise(function(resolve, reject) {
        db.get().query(
            "SELECT plant.minimum, plant.maximum, data.moisture, data.time " +
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