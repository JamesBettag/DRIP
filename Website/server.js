if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

//require('dotenv').config()
const express = require('express')
const app = express()
const flash = require('express-flash')
const session = require('express-session')
var db = require('./db')
const key = process.env.SENDGRID_API_KEY
const port = 3000

app.set('view-engine', 'ejs')
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })) //This solved an error for me "Error: secret option required for sessions"
app.use(express.static(__dirname + '/public')); //global variable so we can access stuff in /public 
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))


db.connect(function ConnectionHandler(err) {
  if(err) {
    console.log('Unable to connect to MySQL')
    process.exit(1)
  }
  console.log('Connection to MySQL Successful')
})

var router = require('./routers/router')
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