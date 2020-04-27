var express = require('express')
var router = express.Router()
var model = require('../models/model')
var emailVerification = require('../verification-email')
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