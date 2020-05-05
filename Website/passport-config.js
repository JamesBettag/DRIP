const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const model = require('./models/model')

//Initialize passport configuration
module.exports = function(passport) {
    passport.use(
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            // match user
            model.getUserEmailPasswordId(email, function DoneGettingUserEmailAndPass(err, result, fields) {
                if(err) {
                    console.log(err)
                } else if(!result.length) { // check if email exists
                    // no email was found
                    return done(null, false, { message: 'Email has not been registered' })
                } else {
                    // email was found and no error
                    bcrypt.compare(password, result[0].password, (err, isMatch) => {
                        if(err) throw err
                        // create user object to send back
                        user = {
                            id: result[0].account_id,
                            email: email,
                            password: result[0].password
                        }
                        // return user if password match
                        if(isMatch) {
                            return done(null, user)
                        } else {
                            return done(null, false, { message: 'Password Incorrect' })
                        }
                    })
                }
            })
        })
    )

    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        model.findUserById(id, function DoneFindingById(err, result, fields) {
            if(!result.length) {
                // empty set
                done(err, null)
            } else {
                user = {
                    id: result[0].account_id,
                    email: result[0].email,
                    password: result[0].password
                }
                done(err, user)
            }
        })
    })

}