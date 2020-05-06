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

//Open login page if you are not alredy logged in 
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('../views/login.ejs')
})

//What happens when you click login button on login screen
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard', //Where do we go if success
    failureRedirect: '/login', //Where do we go if failure 
    failureFlash: true //Display messages 
    //Using passport middleware to authenticate the user
    //Using passports local strategy 
}))

//Open register page if you are not already logged in 
router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

//TODO:Get DeviceID --> Check if exists in DB
//TODO:FLasg error messages
router.post('/register', checkNotAuthenticated, async (req,res) => {
    let errors = []     // initialize empty error array
    const { name, email, password, psw2 } = req.body

    // TODO : CHECK FOR PASS LENGTH?

    // check if passwords match
    if(password !== psw2) {
        errors.push({ msg: 'Passwords do not match' })
    } 
    //Check if email already exists
    accountModel.getUserEmail(email)
    .then(async (values) => {
        // check if an email was returned
        if(values.length) {
            errors.push({ msg: 'email already registered' })
        }
        // check if register post encountered user errors
        if (errors.length > 0) {
            // if there are flash errors to user and enter input back into fields
            res.render('../views/register.ejs', { errors, name, email, password, psw2 })
        } else {
            // no errors were found, hash passwords and account
            const passHash = await bcrypt.hash(password, 10)
            const accHash = await bcrypt.hash(email, 10)
            Promise.all([passHash, accHash])
            .then((values) => {     // wait for bcrypt to hash pass and account
                accountModel.insertNewUser(name, name, email, values[0], values[1], (err, result) => {
                    if(err) {
                        console.log(err)
                        errors.push({ msg: 'The server could not create new user with those credentials' })
                        res.render('../views/register.ejs', { errors, name, email, password, psw2 })
                    } else {
                        // if no errors were found, flash confirmation and redirect to login
                        console.log("Inserted user: " + name)
                        req.flash('success_msg', 'Registration Complete. Please Verify Email Address')
                        res.redirect('/login')
                    }
                })
            })
            .catch((err) => { console.log(err) })
        }
    })
    .catch((err) => { console.log(err) })
})

//Verify the user's account
router.get('/verification?:hash', function verifyUser(req, res){
    //Fix this later
    let myhash = req.query.hash
    accountModel.updateUserVerification(myhash, function DoneUpdatingUserVerification(err, result) {
        if(err) {
            console.log('Error updating verification')
            console.log(err)
        } else {
            console.log('Verification Successful')
            res.redirect('/login')
        }
    })    
})


//Tad's. #1. Display the form for user to enter email
router.get('/forgot-password', checkNotAuthenticated, (req, res) => {
    res.render('../views/forgot-password.ejs')
})

//Tad's #3, broken
//Change the password, this is the link coming from the email
router.get('/passwordchange?:hash', function verifyUser(req, res){
    //Fix this later
    let myhash = req.query.hash
    resetPassModel.checkUserPasswordHash(myhash, function DoneCheckingUserPasswordHash(err, result, fields) {
        if(err) { // check for mysql errors
            console.log('Error Checking User Pass Hash')
            console.log(err)
        } else {
            if(!result.length) { // empty if no valid hashes were found
                console.log('Invalid Password Change Hash')
                res.redirect('/login')
            } else { // found a valid password hash, redirect to change password form

                // NEED TO LOGIN USER FIRST BEFORE REDIRECTING TO CHANGE PASSWORD
                
                res.redirect('/passwordchangeform')
            }            
        }
    })    
})

//Tad's. #2. Send that email to the user
//Send the password change request email
router.post('/forgot-password', checkNotAuthenticated, async (req,res) => {
    let errors = []
    let email = req.body.email
    // get account ID from email
    let accountId = await accountModel.getAccountId(email)
    if(accountId != null) {
        // make previous change pass hashes invalid, and generate new hash
        await resetPassModel.invalidatePreviousChangePasswordHashes(accountId)
        let passHash = await bcrypt.hash((Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)), 10)
        // insert new hash for account
        let inserted = await resetPassModel.insertResetPasswordRequest(accountId, passHash)
        if (inserted) {
            // if hash was inserted, send email and flash success message, then redirect
            passwordChange.sendPasswordChangeEmail(email, passHash)
            req.flash('success_msg', 'Email Sent!')
            res.redirect('/login')
        } else {
            // hash was not inserted, mysql problem
            errors.push({ msg: 'Could Not make a new password request' })
            res.render('../views/forgot-password.ejs', { errors, email })
        }
    } else {
        // no account ID found from email
        errors.push({ msg: 'Email has not been registered' })
        res.render('../views/forgot-password.ejs', { errors, email })
    }
})


/*
//Tad's. #
//Insert the newly changed password into the database, this is broken
router.post('/passwordchange', checkNotAuthenticated, async (req,res) => {
    var hashedPassword
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10)
        res.redirect('/login')
    } catch (e){
        res.redirect('/register')
    }
    try {
        accountModel.insertNewUser(req.body.name, req.body.name, req.body.email, hashedPassword, hashedAccount, function DoneInsertingUser(err, result) {
            if(err) {
                console.log('Error changing password')
                console.log(err)
            } else {
                console.log('Successfully changed password')
                //Send the email
                //passwordChange.sendPasswordChangeEmail(req.body.email, hashedAccount);

            }
        })
    } catch (err) {
        console.log('Error from InsertNewUser')
    }    

    //console.log(users)
})
*/




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
        return res.redirect('/') //Sends you to dashboard
    }
    next() //Sends to login
}

module.exports = router