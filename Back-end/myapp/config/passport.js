const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userController = require('../controller/userController');
const userModel = require("../model/userModel.js");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/users/auth/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const { user } = await userController.findOrCreateGoogleUser(profile);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;