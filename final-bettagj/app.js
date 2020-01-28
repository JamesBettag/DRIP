// server.js: Main Program

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var db         = require('./db');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3002;        // set our port

db.connect(function ConnectionHandler(err){
    if (err){
        console.log('Unable to connect to MySQL');
        process.exit(1);
    }
    console.log("Connection to MySQL Successfull");
});

// ROUTES FOR OUR API
// =============================================================================
app.all('/api', function HandleAll(request, response, next){
    console.log(request.connection.remoteAddress);
    next();
});

var categoryRouter = require('./routers/categories.js');
var filmsRouter = require('./routers/films.js');
app.use(express.static('public'));

// more routes for our API will happen here
app.use('/api', filmsRouter);
app.use('/api', categoryRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Version 3: Magic happens on port ' + port);
