const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const vkontakteStrategy = require('passport-vkontakte').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

passport.use('login', new localStrategy(
    {
        usernameField: 'login',
        passwordField: 'password'
    },
    async (username, password, done) => {
        try {
            let user = await User.findOne({ email: username })
            if (!user) {
                console.error(`User not exist: '${username}'`);
                return done(null, false, { message: 'User not exist' });
            }
            else if (!user.validatePassword(password)) {
                console.error(`Wrong password: '${password}'`);
                return done(null, false, { message: 'Wrong password' });
            }

            console.log(`Local login success for '${username}'`);
            return done(null, user);
        } catch (error) {
            console.error(`Error logging for '${username}': ${error.message}`);
            return done(null, false, { message: error.message });
        }
    }
));

passport.use('signup', new localStrategy(
    {
        usernameField: 'login',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, username, password, done) => {
        try {
            let user = await User.findOne({ 'email': username })
            if (user) {
                console.log('User already exists');
                return done(null, false, { message: 'User already exists' });
            } if (password != req.body.confirmPassword) {
                console.log('Passwords do not match');
                return done(null, false, { message: 'Passwords do not match' });
            } if (password.length < 5) {
                console.log('Password is too short');
                return done(null, false, { message: 'Password is too short' });
            } else {
                let newUser = new User();
                newUser.email = username;
                newUser.setPassword(password);

                await newUser.save();

                console.log('User Registration succesful');
                return done(null, newUser);
            }
        } catch (error) {
            console.error(`Error signuping for '${username}': ${error.message}`);
            return done(null, false, { message: error.message });
        }
    }));

passport.use('vkontakte', new vkontakteStrategy(
    {
        clientID: process.env.VK_CLIENT,
        clientSecret: process.env.VK_SECRET,
        callbackURL: process.env.CALLBACK_URL + "/User/Login/Vkontakte/callback",
        //profileFields: ['emails'],
        passReqToCallback: true
    },
    ExternalLoginCallback
));

passport.use('facebook', new facebookStrategy(
    {
        clientID: process.env.FB_CLIENT,
        clientSecret: process.env.FB_SECRET,
        callbackURL: process.env.CALLBACK_URL + "/User/Login/Facebook/callback",
        //profileFields: ['emails'],
        passReqToCallback: true
    },
    ExternalLoginCallback
));

async function ExternalLoginCallback(req, accessToken, refreshToken, profile, done) {
    try {
        let user;
        if (req.user) {
            user = await User.findById(req.user.id);
            user.externalLogins.push({
                serviceName: profile.provider,
                profileId: profile.id
            });
            await user.save();
        } else {
            user = await User.findOne({ "externalLogins.profileId": profile.id })
            if (!user) {
                user = new User();
                user.externalLogins = [{
                    serviceName: profile.provider,
                    profileId: profile.id
                }];
                await user.save();
            }
        }

        console.log(`External login ${profile.provider} successful`);
        done(null, user);
    }
    catch (error) {
        console.error(`Error in ${profile.provider} external login: ${error.message}`);
        done(null, false, { message: error.message });
    }
}

passport.serializeUser((user, done) =>
    done(null, user.id)
);
passport.deserializeUser(async (id, done) => {
    let user = await User.findById(id);
    done(null, user);
});

module.exports = passport;