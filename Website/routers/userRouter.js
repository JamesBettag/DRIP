var express = require('express')
var router = express.Router()
var accountModel = require('../models/accountModel')
const dataModel = require('../models/dataModel')
const resetPassModel = require('../models/resetPassModel')
var emailVerification = require('../config/verification-email.js')
var passwordChange = require('../config/password-change.js')   //Tad's
const flash = require('express-flash') //Displays messages if failed login used inside of passport
const session = require('express-session') //So we can store and access users over multiple sessions
const methodOverride = require('method-override')
const moment = require('moment')
const bcrypt = require('bcryptjs')

router.use(methodOverride('_method'))

//Open dashboard if you are currently logged in 
router.get('/dashboard', checkAuthenticated, nocache, async (req, res) => {
    // first get graph data and device info
    let name = req.user.email
    var stopDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    var startDate = moment(stopDate).subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss")
    var data = await dataModel.getGraphData(req.user.id, startDate, stopDate)
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
                    pointBackgroundColor: '#57B845',
                    pointBorderColor: '#57B845',
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
router.get('/plants', checkAuthenticated, nocache, async (req, res) => {
    let plants = []
    userPlants = await dataModel.getUserPlants(req.user.id)
    if (userPlants != null) {
        userPlants.forEach((plant) => {
            plants.push({ id: plant.plant_id, name: plant.plant_name })
        })
        res.render('../views/plants.ejs', { plants })
    } else {
        res.render('../views/plants.ejs')
    }
    
})

//Need to make this and use URL to get here
router.get('/changeMoisture', checkAuthenticated, nocache, async(req,res) => {
    const {plantid, deviceid} = req.query
    inserted = await accountModel.updatePlantMoisture(plantid, deviceid)
    res.redirect('/users/plants')
})

router.post('/addPlant', checkAuthenticated, nocache, (req, res) => {
    console.log(req.body)
    res.redirect('/user/plants')
})

router.get('/changePlant', checkAuthenticated, nocache, async(req,res) => {
    const {plantid, deviceid} = req.query
    inserted = await accountModel.updateActivePlant(plantid, deviceid)
    res.redirect('/users/devices')
})

//Open devices if you are currently logged in
router.get('/devices', checkAuthenticated, nocache, (req, res) => {
    let devices = []
    let plants = []
    // retrieve user's devices and plants from DB
    userDevices = dataModel.getUserDevicesAndActivePlant(req.user.id)
    userPlants = dataModel.getUserPlants(req.user.id)
    Promise.all([userDevices, userPlants])
    .then((values) => {
        if (values[0] != null && values[1] != null) {
            // user has both a device and a plant
            values[0].forEach((row) => {
                devices.push({ name: row.device_name, id: row.device_id, plant: row.plant_name })
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

router.post('/renameDevice', checkAuthenticated, nocache, async (req, res) => {
    const { device_name, original, device_id } = req.body
    // check if the user changed the name
    if (device_name != original) {
        // user has changed the device name
        renamed = await accountModel.renameDevice(device_id, device_name)
        if (renamed) {
            // device was renamed
            req.flash('success_msg', 'Device renamed to ' + device_name)
        } else {
            // device was not renamed (result.affectedRows = 0)
            req.flash('error_msg', 'Unable to rename device')
        }
    }
    res.redirect('/users/devices')
})

router.post('/removeDevice', checkAuthenticated, nocache, async (req, res) => {
    deviceId = req.body.deviceid
    removed = await accountModel.deleteDevice(req.user.id, deviceId)
    if(removed){
        req.flash('success_msg', 'Device Successfully Removed')
    }else {
        req.flash('error_msg', 'Device Not Removed')
    }
    res.redirect('/users/devices')
})

router.post('/addDevice', checkAuthenticated, nocache, async(req,res) => {
    const {new_device_name, new_device_id} = req.body
    inserted = await accountModel.insertNewDevice(req.user.id, new_device_id, new_device_name)
    if(inserted){
        req.flash('success_msg', 'Device Successfully Registered')
    }else {
        req.flash('error_msg', 'Device Not Added')
    }
    res.redirect('/users/devices')
})

//Open account if you are currently logged in
router.get('/account', checkAuthenticated, nocache, async(req, res) => {
    user_name = await accountModel.getUserName(req.user.id)
    res.render('../views/account.ejs', {user_name})
})

//Logout
router.delete('/logout', (req, res) => {
    req.logOut() //Passport fuction to terminate session
    res.redirect('/login') //Sends back to login screen
})

//Tad's Account Name and Password Changer, used in account.ejs and accountModel.js
//Insert the newly changed password into the database
router.post('/nameandpasswordchange', checkAuthenticated, async (req,res) => {
    let success = []
    let errors = []
    const { user_name, password, password2 } = req.body

    //If all 3 fields are filled
    if((user_name != '') && (password != '') && (password2 != ''))
    {
        // check if password match
        if(password !== password2) {
            errors.push({ msg: 'Passwords Do Not Match' })
            res.render('../views/account.ejs', { errors, user_name, password, password2 })
        } else {
           let hashedPassword = await bcrypt.hash(password, 10)
            //let inserted = await accountModel.updatePasswordById(req.user.id, hashedPassword)
            let fname = user_name;
            let lname = user_name;
            let inserted = await accountModel.updateNameAndPasswordById(req.user.id, fname, lname, hashedPassword)

            if(inserted) {
                // Name and password were changed
                req.flash('success_msg', 'Name and Password Changed Successfully')
                //errors.push({ msg: 'Password Successfully Changed' })
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Name and password were not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Name and Password Unsuccessfully Changed')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
        }
    }
    else if((user_name != '') && ((password == '') && (password2 == '')))     //If username is filled AND both of the passwords are not filled
    {
            let fname = user_name;
            let lname = user_name;
            let inserted = await accountModel.updateNameById(req.user.id, fname, lname)

            if(inserted) {
                // Name was changed
                req.flash('success_msg', 'Name Changed Successfully')
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Name was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Name Unsuccessfully Changed')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
    }
    else if((user_name == '') && (password != '') && (password2 != ''))   //If username is empty AND both password fields are filled
    {
        // check if password match
        if(password !== password2) {
            errors.push({ msg: 'Passwords Do Not Match' })
            res.render('../views/account.ejs', { errors, user_name, password, password2 })
        } else {
           let hashedPassword = await bcrypt.hash(password, 10)
            let inserted = await accountModel.updatePasswordById(req.user.id, hashedPassword)

            if(inserted) {
                // Password was changed
                req.flash('success_msg', 'Password Changed Successfully')
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Password was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Password Unsuccessfully Changed')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
        }
    }
    else if((password == '') || (password2 == ''))   //If only one password field is filled
    {
        req.flash('error_msg', 'Both password fields must be filled')
        res.redirect('/users/account')
    }
    else
    {
        req.flash('error_msg', 'Enter an input into one of the fields')
        res.redirect('/users/account')
    }
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