var express = require('express')
var router = express.Router()
const dataModel = require('../models/dataModel')
const methodOverride = require('method-override')
var notificationEmail = require('../config/notification-email.js')
const accountModel = require('../models/accountModel')

router.use(methodOverride('_method'))

router.get('/insert', async (req, res) => {
    const { mac, data } = req.query
    // get plant ID from db
    plantId = await dataModel.getPlantID(mac)
    if(plantId != null) {
        // check if plant id exists, if so, insert the data to the plant
        const inserted = dataModel.insertMoistureData(plantId, data)
        const accountAndEmail = await accountModel.getAccountAndEmailByDevice(mac)
        const notification = await accountModel.getNotification(accountId)
        const accountId = accountAndEmail[0].account_id
        const email = accountAndEmail[0].email
        if (notification) {
            min = await dataModel.getMinimumFromPlant(plantId)    //Return minimum from plant
            if (data < min) {
                notificationEmail.sendNotificationEmail(email)  //Send the notification email using the email as a parameter
            }
        }
        // make sure moisture data has been inserted at this point
        await Promise.all([inserted])
        // send code to pi for it to interpret success        
        res.send("0")
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
