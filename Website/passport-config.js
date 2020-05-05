const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

//Initialize passport configuration
function initialize(passport, getUserByEmail, getUserPass){
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)//Need to query for user by email
        const userPass = getUserPass(email)
        console.log("PASSPORT-CONFIG: ")
        console.log(userPass)
        console.log(user)
        if (user == null){
            console.log("Could not find user")
            return done(null, false, {message: 'No user with that email'})
        }
        try {
            //Need to query for password associated with email 
            if(await bcrypt.compare(password, userPass)){ //Password being entered from fourm compared to stored password associated to the email entered
                return done(null, user)
            }
            else{
                return done(null, false, {message: 'Password incorrect'})
            }
        } catch (error) {
            return done(error)
        }
    }

    passport.use(new localStrategy({usernameField: 'email' }, 
    authenticateUser)) //Tells passport to authenticate on email and password
    passport.serializeUser((user, done) => done(null, user.email)) //Stores the user inside of current session
    passport.deserializeUser((id, done) => { //Opposite of serializing the user for current session
        return done(null)
    })
}

module.exports = initialize