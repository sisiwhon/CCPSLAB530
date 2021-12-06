if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
        id => users.find(user => user.id === id),
)

const users = []
//
app.set('view-engine', 'ejs')
//telling application to take information from form and want to be able to request them in post method
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//home page route: name is the name that is shown on homepage
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})
//Routes for login and register and render is /login and /reg
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
//
app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login', 
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
//hashed password = create a new user with a correct hashed password... if correct /login not /register
app.post('/register', checkNotAuthenticated, async(req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id:Date.now().toString(),
            name: req.body.name,
            email:req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch{
        res.redirect('/register')
    }
})

app.delete('/login', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){

        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req,res, next){
    if (req.isAuthenticated()){
        return res.redirect ('/')
}
    next()
}



//Running on port 3000
    app.listen(3000)
