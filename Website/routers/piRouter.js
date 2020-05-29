var express = require('express')
var router = express.Router()
const dataModel = require('../models/dataModel')
const methodOverride = require('method-override')
var notificationEmail = require('../config/notification-email.js')   //Tad's
const accountModel = require('../models/accountModel')

router.use(methodOverride('_method'))

router.get('/insert', async (req, res) => {
    const { mac, data } = req.query
    // get plant ID from db
    plantId = await dataModel.getPlantID(mac)
    if(plantId != null) {
        // check if plant id exists, if so, insert the data to the plant
        await dataModel.insertMoistureData(plantId, data)
        var min = await dataModel.getMinimumFromPlant(plantId)    //Return minimum from plant     //NEW
        console.log(data)
        console.log(min[0].minimum)

        //If the new datapoint is less than the Plant Table's set minimum   //NEW
        if(data < min[0].minimum){ //NEW
            var email = await accountModel.getUserEmailByPlantId(plantId)   //Query the database to retrieve the email  //NEW
            console.log(email[0].email)
            notificationEmail.sendNotificationEmail(email[0].email)  //Send the notification email using the email as a parameter   //NEW
        }

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
