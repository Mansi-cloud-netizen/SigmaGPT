import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      
      // If user signed up with Google/Facebook without a password
      if (!user.password) {
        return done(null, false, { message: 'Please login using your social account.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: "https://sigmagpt-backend-n35v.onrender.com/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Also check if email exists to link accounts potentially (simplified here)
        user = await User.findOne({ email: profile.emails?.[0]?.value });
        if (user) {
           user.googleId = profile.id;
           await user.save();
        } else {
           user = await User.create({
             googleId: profile.id,
             name: profile.displayName,
             email: profile.emails?.[0]?.value,
             avatar: profile.photos?.[0]?.value
           });
        }
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// ---------------- FACEBOOK STRATEGY REMOVED ----------------

export default passport;
