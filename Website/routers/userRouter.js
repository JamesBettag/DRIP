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
    let graphTitles = []

    var stopDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    var startDate = moment(stopDate).subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss")
    const userPlants = await accountModel.getRecentPlantIds(req.user.id, startDate, stopDate)
    // variable to hold number of plants so the same number of canvases can be displayed
    if (userPlants != null) {
        // get number of plants active in last 24 hours
        numCanvas = Object.keys(userPlants).length
        // create double arrays with rows set to numbers of plants
        var globalLabelData = new Array(numCanvas)
        var globalMoistureData = new Array(numCanvas)
        var globalMaxData = new Array(numCanvas)
        var globalMinData = new Array(numCanvas)
        // create a promise so that router will wait for data before rendering page
        const waitForGraph = new Promise((resolve, reject) => {
            i = 0
            userPlants.forEach(async function (plant) {
                const data = await dataModel.getGraphData(req.user.id, plant.plant_id, startDate, stopDate)
                if (data != null) {
                    dataInSet = Object.keys(data).length
                    // set 2d arrays column's to number of rows in data (number of data points)
                    globalLabelData[i] = new Array(dataInSet)
                    globalMoistureData[i] = new Array(dataInSet)
                    globalMaxData[i] = new Array(dataInSet)
                    globalMinData[i] = new Array(dataInSet)
                    graphTitles.push(data[0].plant_name)
                    j = 0
                    data.forEach((row) => {
                        // add all data into 2d arrays
                        globalLabelData[i][j] = moment(row.time).format("MM-DD HH:mm")
                        globalMoistureData[i][j] = row.moisture
                        globalMaxData[i][j] = row.maximum
                        globalMinData[i][j] = row.minimum
                        j++
                    })
                }
                i++
                // check if loop is finished
                if (i == numCanvas) {
                    // if loop is finished, resolve promise
                    resolve(true)
                }
            })
        })
        // wait for all data to be pushed to the 2d arrays
        await waitForGraph.then((returnValue) => {
            if(returnValue) { // pointless check here, don't need it
                res.render('../views/dashboard.ejs', { name, numCanvas, graphTitles, globalLabelData, globalMoistureData, globalMaxData, globalMinData })
            }
        }).catch((err) => {
            console.log(err)
        })
    } else {
        numCanvas = 'empty'
        res.render('../views/dashboard.ejs', { name, numCanvas })
    }
})

//Open plants if you are currently logged in 
router.get('/plants', checkAuthenticated, nocache, async (req, res) => {
    let plants = []
    // get all user's plants from db
    userPlants = await accountModel.getUserPlants(req.user.id)
    if (userPlants != null) {
        // push all plant info to plants array
        userPlants.forEach((plant) => {
            plants.push({ id: plant.plant_id, name: plant.plant_name, min: plant.minimum })  
        })
        res.render('../views/plants.ejs', { plants })
    } else {
        res.render('../views/plants.ejs')
    }
    
})

router.post('/changeMoistureLevel', checkAuthenticated, nocache, async(req,res) => {
    const { plant_moisture, original, plant_id } = req.body
    // check if plant_moisture is a valid number
    if (isNaN(plant_moisture)) {
        // send error code to Ajax if NaN
        res.status(400)
        res.send('Invalid Moisture number')
    } else {
        // change precision to 2 decimal places
        moisture = parseFloat(plant_moisture).toFixed(2)
        // check if moisture level was changed
        if (moisture != original) {
            // check if moisture level has valid input
            if (moisture >= 0 && moisture <= 100) {
                const changed = await dataModel.setPlantMoisture(plant_id, moisture)
                if (changed) {
                    res.status(200)
                    res.send('Moisture level changed')
                } else {
                    res.status(400)
                    res.send('Could not change moisture level')
                }
            } else {
                res.status(400)
                res.send('Invalid Moisture Input')
            }
        }
    }
})

router.post('/addPlant', checkAuthenticated, nocache, async(req, res) => {
    plantName = req.body.new_plant_name
    min = req.body.new_min
    max = 100
    if(min >= 0 && min <= 100){
        // insert new plant info into db
        inserted = await accountModel.insertNewPlant(req.user.id, plantName, min, max)
        if(inserted){
            req.flash('success_msg', 'Plant Profile Successfully Added')    
        }else{
            req.flash('error_msg', 'Plant Profile Not Added')
        }
    }
    else{
        req.flash('error_msg', 'Moisture range is only 0 - 100')
    }
    res.redirect('/users/plants')
})

router.post('/removePlant', checkAuthenticated, nocache, async(req, res) => {
    const plantId = req.body.plantid
    // check if plant has device connected to it
    const deviceId = await accountModel.plantHasDevice(plantId)
    if (deviceId != null) {
        // change device's plant_id to null
        await accountModel.changeDevicePlantToNull(deviceId)
    }
    // delete data associated with plant 
    const deletedData = await accountModel.deletePlantData(plantId)
    if(deletedData){
        // delete plant from plant table
        const removed = await accountModel.deletePlant(req.user.id, plantId)
        if (removed) {
            req.flash('success_msg', 'Plant Profile Successfully Removed')
        } else {
            req.flash('error_msg', 'Plant Profile Not Removed')
        }
    }
    else{
        req.flash('error_msg', 'Plant Profile Not Removed')
    }
    
    res.redirect('/users/plants')
})

//TODO
router.post('/renamePlant', checkAuthenticated, nocache, async(req, res) => {
    const { plant_name, original, plant_id } = req.body
    // check if the user changed the name
    if (plant_name != original) {
        // user has changed the device name
        renamed = await accountModel.renamePlant(plant_id, plant_name)
        if (renamed) {
            // device was renamed
            req.flash('success_msg', 'Plant renamed')
        } else {
            // device was not renamed (result.affectedRows = 0)
            req.flash('error_msg', 'Unable to rename plant')
        }
    }
    res.redirect('/users/plants')
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
    // query db to remove device
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
    // check if device already exists
    const existingDevice = await accountModel.checkExistingDevice(new_device_id)
    if (!existingDevice) {
        // query db to insert new device
        inserted = await accountModel.insertNewDevice(req.user.id, new_device_id, new_device_name)
        if(inserted){
            req.flash('success_msg', 'Device Successfully Registered')
        }else {
            req.flash('error_msg', 'Device Not Added')
        }
    } else {
        // device already exists
        req.flash('error_msg', 'Device ID already exists')
    }
    res.redirect('/users/devices')
})

//Open account if you are currently logged in
router.get('/account', checkAuthenticated, nocache, async(req, res) => {
    user_name = await accountModel.getUserName(req.user.id)
    user_email = await accountModel.getUserEmailById(req.user.id)
    notification = await accountModel.getNotification(req.user.id)
    res.render('../views/account.ejs', {user_name, user_email, notification})
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
    const { user_name, old_user_name, password, password2, notificationsCheck } = req.body
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
            if(typeof req.body.notificationsCheck != 'undefined'){
                await accountModel.updateNotificationById(req.user.id, true)
            } else {
                await accountModel.updateNotificationById(req.user.id, false)
            }

            if(inserted) {
                // Name and password were changed
                req.flash('success_msg', 'Account info updated successfully')
                //errors.push({ msg: 'Password Successfully Changed' })
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Name and password were not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Account info not updated')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
        }
    }
    else if((user_name != '') && ((password == '') && (password2 == '')))     //If username is filled AND both of the passwords are not filled
    {
        if(user_name != old_user_name){
            let fname = user_name;
            let lname = user_name;
            let inserted = await accountModel.updateNameById(req.user.id, fname, lname)
            if(typeof req.body.notificationsCheck != 'undefined'){
                await accountModel.updateNotificationById(req.user.id, true)
            } else {
                await accountModel.updateNotificationById(req.user.id, false)
            }

            if(inserted) {
                // Name was changed
                req.flash('success_msg', 'Account info updated successfully')
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Name was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Account info not updated')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
        //Still same name check for notification         
        }else{
            if(typeof req.body.notificationsCheck != 'undefined'){
                insertNotify = await accountModel.updateNotificationById(req.user.id, true)
            } else {
                insertNotify = await accountModel.updateNotificationById(req.user.id, false)
            }
            if(insertNotify) {
                // Notification was changed
                req.flash('success_msg', 'Account info updated successfully')
                res.redirect('/users/account')
            } else {
                // Notification was not changed
                req.flash('error_msg', 'Account info not updated')
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
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
            if(typeof req.body.notificationsCheck != 'undefined'){
                await accountModel.updateNotificationById(req.user.id, true)
            } else {
                await accountModel.updateNotificationById(req.user.id, false)
            }

            if(inserted) {
                // Password was changed
                req.flash('success_msg', 'Account info updated successfully')
                //res.redirect('/dashboard')
                res.redirect('/users/account')
            } else {
                // Password was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
                // process.exit(1)
                req.flash('error_msg', 'Account info not updated')
                //req.logOut()
                res.render('../views/account.ejs', { errors, user_name, password, password2 })
            }
        }
    }
    else if((user_name == '') && (password == '') && (password2 == ''))   //If username and both passwords are empty, submit only checkbox
    {
        
        if(typeof req.body.notificationsCheck != 'undefined'){
            insertNotify = await accountModel.updateNotificationById(req.user.id, true)
        } else {
            insertNotify = await accountModel.updateNotificationById(req.user.id, false)
        }
        if(insertNotify) {
            // Password was changed
            req.flash('success_msg', 'Account info updated successfully')
            res.redirect('/users/account')
        } else {
            // Password was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
            req.flash('error_msg', 'Account info not updated')
            res.render('../views/account.ejs', { errors, user_name, password, password2 })
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