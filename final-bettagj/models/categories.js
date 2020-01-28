var db = require('../db');

exports.getAll = function GetAllHandler(done) {
  db.get().query(
    'SELECT * FROM categories', function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
    });
}

exports.getByID = function GetCategoriesByID(id, done) {
  db.get().query(
    'SELECT * FROM categories WHERE category_id = ?', id, function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
    });
}

exports.insert = function InsertCategory(name, done) {
  db.get().query(
    'INSERT INTO categories (name) VALUES (?)', name, function InsertQueryHandler(err, result) {
      if(err) {
        return done(err);
      }
      done(null, result.insertId);
    });
}

exports.singleCategory = function GetCategoryHandler(done) {
  db.get().query(
    'SELECT category_id, name FROM categories', function SelectQueryHandler(err, result, fields) {
      if(err) {
        return done(err);
      }
      done(null, result, fields);
    });
}
