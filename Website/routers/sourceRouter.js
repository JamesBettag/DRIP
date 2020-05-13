var express = require('express')
var router = express.Router()
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

router.get('/css/min', (req, res) => {
    res.sendFile('../public/assets/bootstrap-4.4.1/dist/css/bootstrap.min.css')
})

router.get('/css/dash', (req, res) => {
    res.sendFile('../public/assets/css/dashboard.css')
})

router.get('/js/popper', (req, res) => {
    res.sendFile('../public/assets/js/popper.min.js')
})

router.get('/js/min', (req, res) => {
    res.sendFile('../public/assets/bootstrap-4.4.1/dist/js/bootstrap.min.js')
})

module.exports = router