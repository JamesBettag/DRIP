var express = require('express')
var router = express.Router()
var accountModel = require('../models/accountModel')
const dataModel = require('../models/dataModel')
const resetPassModel = require('../models/resetPassModel')
var emailVerification = require('../config/verification-email')
var passwordChange = require('../config/password-change.js')   //Tad's
const flash = require('express-flash') //Displays messages if failed login used inside of passport
const session = require('express-session') //So we can store and access users over multiple sessions
const methodOverride = require('method-override')
const moment = require('moment')

router.use(methodOverride('_method'))

//Open dashboard if you are currently logged in 
router.get('/dashboard', checkAuthenticated, nocache, async (req, res) => {
    // first get graph data and device info
    let name = req.user.email
    var stopDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    var startDate = moment(stopDate).subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss")
    var data = await dataModel.getGraphData(name, startDate, stopDate)
    // check if query returned anything
    if(data != null) {
        // console.log(data)
        let moistureData = []
        let labelData = []
        let minData = []
        let maxData = []
        var graphTitle = data[0].plant_name
        data.forEach(function(row) {
            labelData.push(moment(row.time).format("MM-DD HH:mm"))
            moistureData.push(row.moisture)
            minData.push(row.minimum)
            maxData.push(row.maximum)
        })

        let chartData = {        
            // The type of chart we want to create
            type: 'line',
    
            // The data for our dataset
            data: {
                labels: labelData,
                datasets: [
                {
                    // threshold for minimum line
                    label: "minimum",
                    borderColor: '#424242',
                    data: minData,
                    pointBorderWidth: 0,
                    pointRadius: 0
                },
                {
                    // threshold for maximum line
                    label: "maximum",
                    borderColor: '#424242',
                    data: maxData,
                    pointBorderWidth: 0,
                    pointRadius: 0
                },
                {
                    // TODO get device name
                    label: graphTitle,
                    backgroundColor: 'rgba(0, 173, 180, 0.55)',
                    borderColor: '#00ADB4',
                    pointBackgroundColor: '#77C425',
                    pointBorderColor: '#77C425',
                    data: moistureData,
                    lineTension: 0.15
                }]
            },
            // Configuration options go here
            options: {
                scales: {
                    yAxes: [{
                        display: true,
                        ticks: { suggestedMin: 0 }
                    }]
                }
            }
        }
        
        // push timestamps labels and moisture data into data
        res.render('../views/dashboard.ejs', { chartData, name })
    } else {
        // no data was found within the last week
        res.render('../views/dashboard.ejs', { name })
    }    
})

//Open plants if you are currently logged in 
router.get('/plants', checkAuthenticated, nocache, (req, res) => {
    res.render('../views/plants.ejs', {name: req.user.email})
})

//Open devices if you are currently logged in
router.get('/devices', checkAuthenticated, nocache, (req, res) => {
    let devices = []
    let plants = []
    // retrieve user's devices and plants from DB
    userDevices = dataModel.getUserDevices(req.user.id)
    userPlants = dataModel.getUserPlants(req.user.id)
    Promise.all([userDevices, userPlants])
    .then((values) => {
        if (values[0] != null && values[1] != null) {
            // user has both a device and a plant
            values[0].forEach((row) => {
                devices.push({ name: row.device_name, id: row.device_id })
            })
            values[1].forEach((row) => {
                plants.push({ name: row.plant_name, id: row.plant_id })
            })
            res.render('../views/devices.ejs', { devices, plants })
        } else if (values[0] != null) {
            // user has a device but no plant registered
            values[0].forEach((row) => {
                devices.push({ name: row.device_name, id: row.device_id })
            })
            res.render('../views/devices.ejs', { devices })
        } else if (values[1] != null) {
            // user has a plant but no device registered
            values[1].forEach((row) => {
                plants.push({ name: row.plant_name, id: row.plant_id })
            })
            res.render('../views/devices.ejs', { plants })
        } else {
            // user has neither devices nor plants
            res.render('../views/devices.ejs')
        }
    })
    .catch((err) => { 
        console.log(err)
        res.render('../views/devices.ejs')
     })
})

//Open account if you are currently logged in
router.get('/account', checkAuthenticated, nocache, (req, res) => {
    res.render('../views/account.ejs', {name: req.user.email})
})

//Logout
router.delete('/logout', (req, res) => {
    req.logOut() //Passport fuction to terminate session
    res.redirect('/login') //Sends back to login screen
})

//This will stop you from entering our dashbaord if you are not registered/signed in
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next() //Allows you to proceed 
    }

    res.redirect('/login') //Sends back to login
}

//Wont send you back to login page if your already logedin
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/dashboard') //Sends you to dashboard
    }
    next() //Sends to login
}

//Disables cache
function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  }
module.exports = router