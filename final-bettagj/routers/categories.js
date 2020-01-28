var express = require('express');
var router = express.Router();
var categoryModel = require('../models/categories');

router.get('/categories', function CategoriesGetHandler(request, response) {
  categoryModel.getAll(function DoneGettingAll(err, result, fields) {
    if(err) {
      console.log('Error Getting All Categories');
      console.log(err);
    } else {
      console.log('Successfully Got All Categories');
      response.json(result);
    }
  });
});

router.get('/categories/:id', function CategoriesGetByIDHandler(request, response) {
  categoryModel.getByID(request.params.id, function DoneGettingByID(err, result, fields) {
    if(err) {
      console.log('Error Getting Categories by ID');
      console.log(err);
    } else {
      console.log('Successfully Got Categories by ID');
      response.json(result);
    }
  });
});

router.post('/categories', function CategoriesPostHandler(request, response) {
  categoryModel.insert(request.body.categoryName, function DoneInserting(err, result) {
    var retval = '';
    retval += '<!DOCTYPE html> \n' +
    ' <html> \n' +
    '   <head> \n' +
    '     <meta charset="utf-8" \n' +
    '       <title>Insert Category Confirmation</title> \n' +
    '       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"> \n' +
    '   </head> \n' +
    '   <body> \n';
    if(err) {
      console.log('Error Inserting Category');
      console.log(err);
      retval += '<h2>Could Not Insert Category!</h2> \n';
    } else {
      console.log('Successfully Inserted Category');
      retval += '     <h2>Successfully Inserted Category</h2> \n' +
      '     <h3>Category ID: ' + result + ' </h3> \n';

    }
    retval += '   </body> \n' +
    ' </html> \n';
    response.end(retval);
  });
});

router.get('/just-categories', function CategoriesGetHandler(request, response) {
  categoryModel.singleCategory(function DoneGettingCategory(err, result, fields) {
    if(err) {
      console.log('Error Getting Single Category');
      console.log(err);
    } else {
      console.log('Successfully Got Category Titles');
      response.json(result);
    }
  });
});

module.exports = router;
