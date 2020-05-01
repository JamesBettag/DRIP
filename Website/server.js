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






/*
send email code
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(key);
const msg = {
  to: 'bettagj@spu.edu',
  from: 'notifications.drip@gmail.com',
  subject: 'Test1',
  text: 'This is a test',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
//ES6
sgMail
  .send(msg)
  .then(() => {}, error => {
    console.error(error);
 
    if (error.response) {
      console.error(error.response.body)
    }
  });
//ES8
(async () => {
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
 
    if (error.response) {
      console.error(error.response.body)
    }
  }
})();
*/