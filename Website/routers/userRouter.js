var express = require('express')
var router = express.Router()
var accountModel = require('../models/accountModel')
const resetPassModel = require('../models/resetPassModel')
var emailVerification = require('../verification-email')
var passwordChange = require('../password-change.js')   //Tad's
const bcrypt = require('bcryptjs')
const passport = require('passport') //Compares passwords
const flash = require('express-flash') //Displays messages if failed login used inside of passport
const session = require('express-session') //So we can store and access users over multiple sessions
const methodOverride = require('method-override')

router.use(methodOverride('_method'))


//Open dashboard if you are currently logged in 
router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('../views/dashboard.ejs', {name: req.user.email})
})

//Logout
router.delete('/logout', (req, res) => {
    req.logOut() //Passport fuction to terminate session
    res.redirect('/login') //Sends back to login screen
})

//This will stop you from entering our dashbaord if you are not registered/signed in
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next() //Sends to dashboard
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

module.exports = router