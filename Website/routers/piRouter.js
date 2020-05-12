var express = require('express')
var router = express.Router()
const dataModel = require('')
const passport = require('passport') //Compares passwords
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

router.get('/insert', (req, res) => {

})

module.exports = router