var db = require('../db')

exports.insertNewUser = function InserNewUserHandler(fname, lname, email, pass, done) {
    db.get().query(
        'INSERT INTO account (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [fname, lname, email, pass], function InserNewUserQueryHandler(err, result) {
            if(err) {
                return done(err)
            }
            done(null, result.insertId)
        }
    )
}