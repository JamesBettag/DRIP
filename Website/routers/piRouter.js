var express = require('express')
var router = express.Router()
const dataModel = require('../models/dataModel')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

router.get('/insert', async (req, res) => {
    const { mac, data } = req.query
    plantId = await dataModel.getPlantID(mac)
    if(plantId != null) {
        await dataModel.insertMoistureData(plantId, data)
        res.send("0")
    } else {
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
