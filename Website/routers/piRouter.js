var express = require('express')
var router = express.Router()
const dataModel = require('../models/dataModel')
const methodOverride = require('method-override')
var notificationEmail = require('../config/notification-email.js')
const accountModel = require('../models/accountModel')

router.use(methodOverride('_method'))

router.post('/insert', async (req, res) => {
    const { mac, data } = req.body
    // get plant ID from db
    plantAndAccount = await dataModel.getPlantAndAccountId(mac)
    if((plantAndAccount != null) && (plantAndAccount[0].plant_id != null)) {
        const accountId = plantAndAccount[0].account_id
        const plantId = plantAndAccount[0].plant_id
        // check if plant id exists, if so, insert the data to the plant
        const inserted = dataModel.insertMoistureData(plantId, data)
        const waitEmail = accountModel.getUserEmailById(accountId)
        const waitNotification = accountModel.getNotification(accountId)
        Promise.all([waitEmail, waitNotification])
        .then(async ([email, notification]) => {
            if (notification) {
                const min = await dataModel.getMinimumFromPlant(plantId)    //Return minimum from plant
                if (data < min) {
                    notificationEmail.sendNotificationEmail(email)  //Send the notification email using the email as a parameter
                }
            }
            // make sure moisture data has been inserted at this point
            await Promise.all([inserted])
            // send code to pi for it to interpret success        
            res.send("0")
        })
        .catch((err) => {
            console.log(err)
        })
    } else {
        // no plant was found, check if device exists
        const deviceId = await dataModel.getDeviceID(mac)
        if(deviceId != null) {
            // code to send to pi that user doesn't have plant registered to a sensor
            res.send("1")
        } else {
            // code to send to pi that user does not have a device registered
            res.send("2")
        }
    }
})

module.exports = router
