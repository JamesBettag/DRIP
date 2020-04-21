var express = require('express')
var router = express.Router()
var model = require('../models/model')
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
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        //IF USING DB DONT NEED THIS
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        

        res.redirect('/login')
    } catch (e){
        res.redirect('/register')
    }
    model.insertNewUser(req.body.name, req.body.name, req.body.email, hashedPassword, function DoneInsertingUser(err, result) {
        if(err) {
            console.log('Error Inserting')
            console.log(err)
        } else {
            console.log('Successful Insertion')
        }
    })

    console.log(users)
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