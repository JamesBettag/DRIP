const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const accountModel = require('../models/accountModel')

//Initialize passport configuration
module.exports = function(passport) {
    passport.use(
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            // match user
            accountModel.getUserEmailPasswordId(email, (err, result, fields) => {
                if(err) {
                    console.log(err)
                } else if(!result.length) { // check if email exists
                    // no email was found
                    return done(null, false, 'Email has not been registered')
                } else {
                    // email was found and no error

                    // check if email has been verified
                    if (result[0].verify == "0") {
                        return done(null, false, 'Please Verify Your Email')
                    }
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
                            return done(null, false, 'Password Incorrect')
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
        accountModel.findUserById(id, (err, result, fields) => {
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