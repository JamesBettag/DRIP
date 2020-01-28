var db = require('../db');

exports.getAll = function GetAllHandler(done) {
  db.get().query(
    'SELECT film_id, title, description, release_year, length, rating, c.name, c.last_update FROM categories c, films f WHERE f.category_id = c.category_id', function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
  });
}

exports.getByID = function GetFilmByIDHandler(id, done) {
  db.get().query(
    'SELECT film_id, title, description, release_year, length, rating, c.name, c.last_update FROM films f, categories c WHERE f.category_id = c.category_id AND film_id = ?', id, function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
    });
}

exports.insert = function InsertHandler(title, description, releaseYear, length, rating, categoryID, done) {
  db.get().query(
    'INSERT INTO films (title, description, release_year, length, rating, category_id) VALUES (?, ?, ?, ?, ?, ?)', [title, description, releaseYear, length, rating, categoryID], function InsertQueryHandler(err, result) {
      if(err) {
        return done(err);
      }
      done(null, result.insertId);
    });
}

exports.update = function UpdateHandler(title, description, releaseYear, length, rating, categoryID, filmID, done) {
  db.get().query(
    `UPDATE films SET
      title = ?,
      description = ?,
      release_year = ?,
      length = ?,
      rating = ?,
      category_id = ?
      WHERE film_id = ?`,
      [title, description, releaseYear, length, rating, categoryID, filmID],
      function UpdateQueryHandler(err, result) {
        if(err) {
          return done(err);
        }
        done(null, result.affectedRows);
      });
}

exports.delete = function DeleteHandler(filmID, done) {
  db.get().query(
    'DELETE FROM films WHERE film_id = ?', filmID, function DeleteQueryHandler(err, result) {
      if(err) {
        return done(err);
      }
      done(null, result.affectedRows);
    });
}

exports.getAllByCategory = function getAllByCategoryHandler(done) {
  db.get().query(
    'SELECT film_id, title, description, release_year, length, rating, name, f.last_update FROM films f, categories c WHERE c.category_id = f.category_id', function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
    });
}
