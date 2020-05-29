var express = require('express')
var router = express.Router()
var accountModel = require('../models/accountModel')
const resetPassModel = require('../models/resetPassModel')
var emailVerification = require('../config/verification-email.js')
var passwordChange = require('../config/password-change.js')   //Tad's
const bcrypt = require('bcryptjs')
const passport = require('passport') //Compares passwords
const flash = require('express-flash') //Displays messages if failed login used inside of passport
const session = require('express-session') //So we can store and access users over multiple sessions
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

// TODO: handle invalid routes
//Open index
router.get('/index', (req, res) => {
    res.render('../views/index.ejs')
})

//Open dashboard if you are currently logged in 
router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('../views/dashboard.ejs', {name: req.user.email})
})

//Open login page if you are not alredy logged in 
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('../views/login.ejs')
})

//What happens when you click login button on login screen
router.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        let email = req.body.email
        let errors = []
        if (err) { 
            console.log(err) 
            return next(err)
        }
        if (!user) {
            errors.push({ msg: info })
            return res.render('../views/login.ejs', { email, errors })
        }
        req.logIn(user, function(err) {
            if(err) { return next(err) }
            return res.redirect('/users/dashboard')
        })
    }) (req, res, next)
})

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
                        // if user was inserted, send email and flash success message, then redirect
                        emailVerification.sendVerificationEmail(email, accHash)
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
            req.flash('success_msg', 'Verification Successful')
            res.redirect('/login')
        }
    })    
})

//Tad's. #1. Display the form for user to enter email
router.get('/forgot-password', checkNotAuthenticated, (req, res) => {
    res.render('../views/forgot-password.ejs')
})

//Tad's. #2. Send that email to the user
//Send the password change request email
router.post('/forgot-password', checkNotAuthenticated, async (req,res) => {
    let errors = []     // push errors to this empty array
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

//Tad's #3
//Change the password, this is the link coming from the email
router.get('/passwordchange?:hash', async function verifyUser(req, res){
    // TODO: JUST DELETE INVALID HASHES?

    // get pass hash
    // compare pass hash
    // if valid, log user in and redirect to change pass page
    let emailedHash = req.query.hash
    let accountId = await resetPassModel.checkUserPasswordHash(emailedHash)
    if (accountId != null) {
        // hash was valid. invalidate previous hashes. login and redirect to change pass page
        await resetPassModel.invalidatePreviousChangePasswordHashes(accountId)
        let userInfo = await accountModel.getAccountInfoByID(accountId)
        if (userInfo != null) {
            // create a user object and set fields
            let user = {
                id: userInfo[0].account_id,
                email: userInfo[0].email,
                password: userInfo[0].password
            }
            // log user in and redirect to change password page
            req.login(user, function(err) {
                if(err) { return next(err) }
                return res.redirect('/change-password')
            })
        } else {
            // could not find user info from account id (mysql problem)
            req.flash('error_msg', 'Invalid Code')
            res.redirect('/login')
        }
    } else {
        // not a valid hash
        req.flash('error_msg', 'Invalid Code')
        res.redirect('/login')
    }
})

router.get('/change-password', checkAuthenticated, (req, res) => {
    res.render('../views/password-change.ejs')
})

//Tad's. #
//Insert the newly changed password into the database
router.post('/passwordchange', checkAuthenticated, async (req,res) => {
    let errors = []
    const { password, password2 } = req.body

    // check if password match
    if(password !== password2) {
        errors.push({ msg: 'Passwords Do Not Match' })
        res.render('../views/password-change.ejs', { errors, password, password2 })
    } else {
        let hashedPassword = await bcrypt.hash(password, 10)
        let inserted = await accountModel.updatePasswordById(req.user.id, hashedPassword)

        if(inserted) {
            // password was changed
            req.flash('success_msg', 'Password Changed Successfully')
            res.redirect('/users/dashboard')
        } else {
            // password was not changed. could not find an account with that id (big problem: user serialized on website without logging in)
            // process.exit(1)
            req.logOut()
            res.redirect('/login')
        }
    }
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
        return res.redirect('/users/dashboard') //Sends you to dashboard
    }
    next() //Sends to login
}

module.exports = router