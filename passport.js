const { googleClientId, googleClientSecret } = require("./config");
const passport = require("passport");
const User = require("./models/User");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const newUser = new User({
        userName: profile.displayName,
        provider: profile.provider,
        email: profile.emails.value,
        profilePicture: profile.photos[0].value,
        googleId: profile.id,
      });
      try {
        const user = await User.find({ googleId: profile.id });
        if (!user) {
          user = await User.create(newUser);
          return done(null, user);
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
