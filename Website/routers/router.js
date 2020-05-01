var express = require('express')
var router = express.Router()
var model = require('../models/model')
const bcrypt = require('bcryptjs')
const passport = require('passport') //Compares passwords
const flash = require('express-flash') //Displays messages if failed login used inside of passport
const session = require('express-session') //So we can store and access users over multiple sessions
const methodOverride = require('method-override')


//I think this is for signing in?
const initializePassport = require('../passport-config')
initializePassport(
    passport,
    email => model.getUserEmail(email, function DoneGettingUserEmail(err, result, fields) {
        if(err) {
            console.log('Error getting email')
            console.log(err)
        } else {
            if(result == null) {
                console.log('There is no email')
            } else {
                console.log('Found an email')
                console.log(email)
                return email
            }
        }
    }),
    
    userPass => model.getUserPasswordHash(userPass, function DoneGettingUserPassword(err, result, fields) {
        if(err) {
            console.log('Error getting password')
            console.log(err)
        } else {
            if(!result.length) {
                console.log('There is no password')
            } else {
                console.log('Found a hashed password')
                console.log(result)
                return result
            }
        }
    })
)

router.use(flash())

router.use(passport.initialize())
router.use(passport.session()) 
router.use(methodOverride('_method'))

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

//testing
router.get('/email', function EmailGetHandler(req, res) {
    model.getUserEmail('bettagj@spu.edu', function DoneGettingEmail(err, result, fields) {
        if(err) {
            console.log('Error getting email')
            console.log(err)
        } else {
            res.json(result)
        }
    })
})

//Open dashboard if you are currently logged in 
router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('../views/dashboard.ejs', {name: req.user.name})
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

//Hashes password and pushes regestration info to DB
router.post('/register', checkNotAuthenticated, async (req,res) => {
    var hashedPassword
    hashedPassword = await bcrypt.hash(req.body.password, 10)
    try {
        model.insertNewUser(req.body.name, req.body.name, req.body.email, hashedPassword, function DoneInsertingUser(err, result) {
            if(err) {
                console.log('Error Inserting')
                console.log(err)
            } else {
                console.log('Successful Insertion')
            }
        })
    } catch (err) {
        console.log('Error from InsertNewUser')
    }    
    console.log(users)
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
        return res.redirect('/') //Sends you to dashboard
    }
    next() //Sends to login
}

module.exports = router