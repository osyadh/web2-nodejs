const db = require("../lib/db");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports = function(app) {
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;
  const FacebookStrategy = require("passport-facebook").Strategy;
  const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    console.log("serializeUser", user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    const user = db
      .get("users")
      .find({ id: id })
      .value();
    console.log("deserializeUser", id, user);
    done(null, user);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "pwd"
      },
      function(email, password, done) {
        console.log("LocalStrategy", email, password);
        const user = db
          .get("users")
          .find({ email: email })
          .value();
        if (user) {
          bcrypt.compare(password, user.password, function(err, res) {
            if (res) {
              return done(null, user, {
                message: "Logged In"
              });
            } else {
              return done(null, false, {
                message: "wrong password"
              });
            }
          });
        } else {
          return done(null, false, {
            message: "Incorrect user"
          });
        }
      }
    )
  );
  const facebookCredentials = require("../config/facebook.json");
  facebookCredentials.profileFields = ["id", "email", "name", "displayName"];
  passport.use(
    new FacebookStrategy(facebookCredentials, function(
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      console.log("FacebookStrategy", profile);
      const displayName = profile.displayName;
      let user = db
        .get("users")
        .find({ displayName: displayName })
        .value();
      if (user) {
        user.facebookId = profile.id;
        db.get("users")
          .find({ displayName: displayName })
          .assign(user)
          .write();
      } else {
        user = {
          id: shortid.generate(),
          displayName: displayName,
          facebookId: profile.id
        };
        db.get("users")
          .push(user)
          .write();
      }
      done(null, user);
      // User.findOrCreate(..., function(err, user) {
      //   if (err) { return done(err); }
      //   done(null, user);
      // });
    })
  );

  app.get("/auth/facebook", passport.authenticate("facebook"));

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/auth/login"
    })
  );

  const googleCredentials = require("../config/google.json");

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0]
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(accessToken, refreshToken, profile);
        const email = profile.emails[0].value;
        let user = db
          .get("users")
          .find({ email: email })
          .value();
        if (user) {
          user.googleId = profile.id;
          db.get("users")
            .find({ id: user.id })
            .assign(user)
            .write();
        } else {
          user = {
            id: shortid.generate(),
            email: email,
            displayName: profile.displayName,
            googleId: profile.id
          };
          db.get("users")
            .push(user)
            .write();
        }
        done(null, user);
        // User.findOrCreate({ googleId: profile.id }, function(err, user) {
        //   return done(err, user);
        // });
      }
    )
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/plus.login", "email"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/login" }),
    function(req, res) {
      res.redirect("/");
    }
  );

  return passport;
};
