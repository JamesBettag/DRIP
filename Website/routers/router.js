var express = require('express')
var router = express.Router()
var model = require('../models/model')
var emailVerification = require('../verification-email')
var passwordChange = require('../password-change.js')   //Tad's
const bcrypt = require('bcryptjs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


const users = [] //PLACE HOLDER FOR DB

const initializePassport = require('../passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
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

router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('../views/dashboard.ejs', {name: req.user.name})
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('../views/login.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))


router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})


router.post('/register', checkNotAuthenticated, async (req,res) => {
    var hashedPassword
    var hashedAccount
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10)
        hashedAccount = await bcrypt.hash(req.body.email, 10)
        //hashedPasswordChange = await bcrypt.hash((Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)), 10)

        res.redirect('/login')
    } catch (e){
        res.redirect('/register')
    }
    try {
        model.insertNewUser(req.body.name, req.body.name, req.body.email, hashedPassword, hashedAccount, function DoneInsertingUser(err, result) {
            if(err) {
                console.log('Error Inserting')
                console.log(err)
            } else {
                console.log('Successful Insertion')
                //Send the email
                emailVerification.sendVerificationEmail(req.body.email, hashedAccount);
            }
        })


    } catch (err) {
        console.log('Error from InsertNewUser')
    }    

    //console.log(users)
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

//Tad's
//Change the password, this is the link coming from the email
router.get('/passwordchange?:hash', function verifyUser(req, res){
    //Fix this later
    let myhash = req.query.hash
    model.updateUserVerification(myhash, function DoneUpdatingUserVerification(err, result) {
        if(err) {
            console.log('Error updating password')
            console.log(err)
        } else {
            console.log('Moving on to password change page')
            res.redirect('/passwordchangeform')
        }
    })    
})


//Tad's. #2. Send that email to the user
//Send the password change request email
router.post('/passwordchangerequest', checkNotAuthenticated, async (req,res) => {

    var accountId = -1  //Holds Id for use when inserting into reset_password table
    var passHash

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
                }
            }

        })

        console.log(accountId)

        if(accountId >= '0') {
            console.log('Hi james')
            try {
                passHash = await bcrypt.hash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 10)
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
        


        //passwordChange.sendPasswordChangeEmail(req.body.email, hashedAccount);  //Send the password change email
        res.redirect('/login')
    } catch (e){
        res.redirect('/register')
        console.log('account does not exist')
    }
})


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





//Logout
router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

//This will stop you from entering our dashbaord if you are not registered/signed in
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

//Wont send you back to login page if your already logedin
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

module.exports = router