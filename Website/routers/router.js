var express = require('express')
var router = express.Router()
var model = require('../models/model')
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
router.post('/register', checkNotAuthenticated, (req,res) => {
    var hashedPassword
    var hashedAccount
    let errors = []     // initialize empty error array
    const { name, email, password, psw2 } = req.body
    try {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.log("Problem with bcrypt hash\n" + err)
            } else {
                hashedPassword = hash
            }
        })
        bcrypt.hash(email, 10, (err, hash) => {
            if (err) {
                console.log("Problem with bcrypt hash\n" + err)
            } else {
                hashedAccount = hash
            }
        })
        //hashedPasswordChange = await bcrypt.hash((Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)), 10)

    } catch (e){
        console.log(e)
    }

    // TODO CHECK FOR PASS LENGTH?

    // check if passwords match
    if(password !== psw2) {
        errors.push({ msg: 'Passwords do not match' })
    } else {

        //Check if email already exists
        try {
            model.getUserEmail(req.body.email, function DoneGettingUserEmail(err, result, fields) {
                if(err) {
                    console.log('Error getting email')
                    console.log(err)
                } else {
                    if(result == null) {
                        console.log('There is no email - good to insert')
                        try {
                            model.insertNewUser(name, email, hashedPassword, hashedAccount, function DoneInsertingUser(err, result) {
                                if(err) {
                                    console.log('Error Inserting')
                                    console.log(err)
                                } else {
                                    console.log('Successful Insertion')
                                    //Send the email
                                    //res.redirect('/login')
                                    emailVerification.sendVerificationEmail(req.body.email, hashedAccount);
                                }
                            })
                        } catch (err) {
                            console.log('Error from InsertNewUser')
                        }    
                    } else {
                        console.log('Email already in use')
                        console.log(result[0].email)
                        errors.push({ msg: 'Email already in use' })
                        //res.redirect('/register')
                        
                    }
                }
            }) 
        }catch (err) {
            console.log('Error from getUserEmail')
        }
    }
    // check if register post encountered user errors
    if (errors.length > 0) {
        // if there are errors, reload page, flash errors to user and enter input back into fields
        res.render('/register', {
            errors,
            name,
            email,
            password,
            psw2
        })
    } else {
        // no errors found, flash success and redirect
        req.flash('success_msg', 'Registration Complete. Please Verify Email Address')
        res.redirect('/login')
    }
})


//Verify the user's account
router.get('/verification?:hash', function verifyUser(req, res){
    //Fix this later
    let myhash = req.query.hash
    model.updateUserVerification(myhash, function DoneUpdatingUserVerification(err, result) {
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
router.get('/password-change', checkNotAuthenticated, (req, res) => {
    res.render('../views/forgotpassword.ejs')
})

//Tad's #3, broken
//Change the password, this is the link coming from the email
router.get('/passwordchange?:hash', function verifyUser(req, res){
    //Fix this later
    let myhash = req.query.hash
    model.checkUserPasswordHash(myhash, function DoneCheckingUserPasswordHash(err, result, fields) {
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
router.post('/passwordchangerequest', checkNotAuthenticated, async (req,res) => {

    var accountId = -1  //Holds Id for use when inserting into reset_password table
    var passHash = await bcrypt.hash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 10)

    try {
        model.getAccountId(req.body.email, function DoneGettingAccountId(err, result, fields) {
            if(err) {
                console.log('Unable to retrieve account id')
                console.log(err)
            } else {
                console.log('Retrieved account id')
                if(!result.length) {
                    //Comes here if account_id is empty
                    console.log('This is empty')
                } else {
                    //
                    console.log('This is not empty')
                    accountId = result[0].account_id
                    console.log(result[0].account_id)   //result[0].account_id outputs id of first instance
                    if(accountId >= '0') {
                        console.log('Hi james')
                        try {
                            // invalidate previous requested hashes
                            model.invalidatePreviousChangePasswordHashes(accountId, function DoneInvalidatingPreviousChangePasswordHashes(err, result) {
                                if(err) {
                                    console.log('Could Not Invalidate Previous Change Password Hashes: MYSQL Error')
                                    console.log(err)
                                }
                            })
                            model.insertResetPasswordRequest(accountId, passHash, function DoneInsertingResetPassword(err, result){
                                if(err) {
                                    console.log(err)
                                } else {
                                    console.log('Inserting reset password request was successful')
                                    passwordChange.sendPasswordChangeEmail(req.body.email, passHash);  //Send the password change email
                                }
                            }) //Needs id, then passhash, then done function thing
                        } catch (e){
                            console.log('Error sending email for password request')
                        }
                    }
                }
            }

        })
        

        //passwordChange.sendPasswordChangeEmail(req.body.email, hashedAccount);  //Send the password change email
        res.redirect('/login')
    } catch (e){
        res.redirect('/register')
        console.log('account does not exist')
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
        model.insertNewUser(req.body.name, req.body.name, req.body.email, hashedPassword, hashedAccount, function DoneInsertingUser(err, result) {
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