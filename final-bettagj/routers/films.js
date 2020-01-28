var express = require('express');
var router = express.Router();

var filmModel = require('../models/films');

router.get('/films', function FilmsGetHandler(request, response) {
  filmModel.getAll(function DoneGettingAll(err, result, fields) {
    if(err) {
      console.log('Error Getting All Films');
      console.log(err);
    } else {
      console.log('Successfully Retrieved all Films');
      response.json(result);
    }
  });
});

router.get('/films/:id', function FilmsGetByIDHandler(request, response) {
  filmModel.getByID(request.params.id, function DoneGettingByID(err, result, fields) {
    if(err) {
      console.log('Error Getting Film by ID');
      console.log(err);
    } else {
      console.log('Successfully Retrieved Film by ID');
      response.json(result);
    }
  });
});

router.post('/films', function FilmsPostHandler(request, response) {
  console.log(request.body);
  filmModel.insert(
    request.body.title,
    request.body.description,
    request.body.releaseYear,
    request.body.length,
    request.body.rating,
    request.body.category,
    function DoneInserting(err, result) {
      var retval = '';
      retval += '<!DOCTYPE html> \n' +
      ' <html> \n' +
      '   <head> \n' +
      '     <meta charset="utf-8" \n' +
      '       <title>Insert Film Confirmation</title> \n' +
      '       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"> \n' +
      '   </head> \n' +
      '   <body> \n';
      if(err) {
        console.log('Error Inserting Film');
        console.log(err);
        retval += '         <h2>Could Not Insert Film!</h2> \n';
      } else {
        console.log('Successfully Inserted a Film');
        retval += '         <h2>Inserted Film!</h2> \n' +
        '         <h3>ID: ' + result + '</h3> \n';
      }
      '   </body> \n' +
      ' </html> \n';
      response.end(retval);
    });
});

router.put('/films', function FilmsPutHandler(request, response) {
  filmModel.update(
    request.body.title,
    request.body.description,
    request.body.releaseYear,
    request.body.length,
    request.body.rating,
    request.body.categoryID,
    request.body.filmID,
    function DoneUpdating(err, result) {
      if(err) {
        console.log('Error Updating Film');
        console.log(err);
      } else {
        console.log('Successfully Updated a Film');
        response.json(result);
      }
    });
});

router.delete('/films', function FilmsDeleteHandler(request, response) {
  filmModel.delete(request.body.filmID, function DoneDeleting(err, result) {
    var retval = '';
    retval += '<!DOCTYPE html> \n' +
    ' <html> \n' +
    '   <head> \n' +
    '     <meta charset="utf-8" \n' +
    '       <title>Delete Film Confirmation</title> \n' +
    '       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"> \n' +
    '   </head> \n' +
    '   <body> \n';
    if(err) {
      console.log('Error Deleting Film');
      console.log(err);
      retval += '         <h2>Could Not Delete Film!</h2> \n';
    } else {
      console.log('Deleted Film: ' + result);

      if(result != 0) {
        retval += '         <h2>Deleted Film!</h2> \n';
      } else {
        retval += '         <h2>Could Not Delete Film!</h2> \n';
      }
    }
    retval += '   </body> \n' +
    ' </html> \n';
    response.end(retval);
  });
});

router.post('/delete-film', function FilmsDeleteHandler(request, response) {
  filmModel.delete(request.body.filmID, function DoneDeleting(err, result) {
    var retval = '';
    retval += '<!DOCTYPE html> \n' +
    ' <html> \n' +
    '   <head> \n' +
    '     <meta charset="utf-8" \n' +
    '       <title>Delete Film Confirmation</title> \n' +
    '       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"> \n' +
    '   </head> \n' +
    '   <body> \n';
    if(err) {
      console.log('Error Deleting Film');
      console.log(err);
      retval += '         <h2>Could Not Delete Film!</h2> \n';
    } else {
      console.log('Deleted Film: ' + result);

      if(result != 0) {
        retval += '         <h2>Deleted Film!</h2> \n';
      } else {
        retval += '         <h2>Could Not Delete Film!</h2> \n';
      }
    }
    retval += '   </body> \n' +
    ' </html> \n';
    response.end(retval);
  });
});

router.get('/films-categories', function FilmsGetCategoriesHandler(request, response) {
  filmModel.getAllByCategory(function DoneGettingByCategory(err, result) {
    if(err) {
      console.log('Error Getting By Categories');
      console.log(err);
    } else {
      console.log('Successfully Got by Categories');
      response.json(result);
    }
  });
});

router.post('/update-film', function UpdateFilmHandler(request, response) {
  filmModel.update(
    request.body.title,
    request.body.description,
    request.body.releaseYear,
    request.body.length,
    request.body.rating,
    request.body.category,
    request.body.filmID,
    function DoneUpdating(err, result) {
      var retval = '';
      retval += '<!DOCTYPE html> \n' +
      ' <html> \n' +
      '   <head> \n' +
      '     <meta charset="utf-8" \n' +
      '       <title>Update Film Confirmation</title> \n' +
      '       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"> \n' +
      '   </head> \n' +
      '   <body> \n';
      if(err) {
        console.log('Error Updating Film');
        console.log(err);
        retval += '<h2>Could Not Update Film</h2> \n';
      } else {
        console.log('Successfully Updated a Film');
        retval += '<h2>Updated Film Successfully</h2> \n';
      }
      retval += '   </body> \n' +
      ' </html> \n';
      response.end(retval);
    });
});

module.exports = router;
