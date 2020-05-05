if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config() //Loads in process variables from .env
}

//require('dotenv').config()
const express = require('express')
const app = express()
const flash = require('express-flash')
const session = require('express-session')
var db = require('./db')
var router = require('./routers/router')
const bodyParser = require('body-parser');  //James
const url = require('url')
const queryString = require('querystring')
const key = process.env.SENDGRID_API_KEY
const port = 3000
const passport = require('passport')

// passport config
require('./passport-config')(passport)

//app.use(bodyParser.urlencoded({ extended: true })); //James
app.use(bodyParser.json()); //James

app.set('view-engine', 'ejs')
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })) //This solved an error for me "Error: secret option required for sessions"
app.use(express.static(__dirname + '/public')) //Global variable so we can access stuff in /public 
app.use(express.urlencoded({ extended: false })) //Allows us to take input from .ejs fourms and use as req inside of post methods 
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, //Keye the encrypts information for the current session
    resave: false, //Dont resave if nothing has changed
    saveUninitialized: false //Dont save empty values in the session
}))

app.use(passport.initialize())
app.use(passport.session()) 

app.use(flash())

// Global variables (for flash)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})


db.connect(function ConnectionHandler(err) {
  if(err) {
    console.log('Unable to connect to MySQL')
    process.exit(1)
  }
  console.log('Connection to MySQL Successful')
})

//app.use(express.static('public'))

app.use('/', router)

app.listen(port) 
console.log('Listening on port ' + port)
