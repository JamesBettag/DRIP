var express = require('express')
var router = express.Router()
const dataModel = require('../models/dataModel')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

router.get('/insert', async (req, res) => {
    const { mac, data } = req.query
    // get plant ID from db
    plantId = await dataModel.getPlantID(mac)
    if(plantId != null) {
        // check if plant id exists, if so, insert the data to the plant
        await dataModel.insertMoistureData(plantId, data)
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
