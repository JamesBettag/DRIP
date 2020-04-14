if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email)
)

const users = [] //PLACE HOLDER FOR DB

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session()) 

app.get('/', (req, res) => {
    res.render('index.ejs', {name: 'Mathew'})
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
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
    
    console.log(users)
})


app.listen(3000) 