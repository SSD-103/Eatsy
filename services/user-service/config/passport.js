const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/customer/customer.model');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/customer/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Find by Google ID
    let customer = await Customer.findOne({ googleId: profile.id });
    if (customer) {
      return done(null, customer);
    }

    // Find by email (link if local user exists)
    customer = await Customer.findOne({ email: profile.emails[0].value });
    if (customer) {
      customer.googleId = profile.id;
      await customer.save();
      return done(null, customer);
    }

    // Create new user (generate unique username if needed)
    let baseUsername = profile.emails[0].value.split('@')[0];
    let username = baseUsername;
    let suffix = 1;
    while (await Customer.findOne({ username })) {
      username = `${baseUsername}${suffix}`;
      suffix++;
    }

    const newCustomer = new Customer({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      username,
    });
    await newCustomer.save();
    return done(null, newCustomer);
  } catch (err) {
    return done(err);
  }
}));





