const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const db = require("../lib/db");
const shortid = require("shortid");
const bcrypt = require("bcrypt");

module.exports = function(passport) {
  router.get("/login", (req, res) => {
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "WEB - login";
    const temList = template.list(req.list);
    const HTML = template.html(
      title,
      temList,
      `   <div style="color:red;">${feedback}</div>
          <form action="/auth/login" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p><input type="submit" value="login"></p>
          </form>
        `,
      ""
    );
    res.send(HTML);
  });

  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
      successFlash: true
    })
  );

  router.get("/register", (req, res) => {
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    const title = "WEB - login";
    const temList = template.list(req.list);
    const HTML = template.html(
      title,
      temList,
      `   <div style="color:red;">${feedback}</div>
          <form action="/auth/register" method="post">
            <p><input type="text" name="email" placeholder="email" value="ss@asdf.com"></p>
            <p><input type="password" name="pwd" placeholder="password" value="111"></p>
            <p><input type="password" name="pwd2" placeholder="password confirm" value="111"></p>
            <p><input type="text" name="displayName" placeholder="display name" value="ss"</p>
            <p><input type="submit" value="register"></p>
          </form>
        `,
      ""
    );
    res.send(HTML);
  });

  router.post("/register", (req, res) => {
    const post = req.body;
    const email = post.email;
    const pwd = post.pwd;
    const pwd2 = post.pwd2;
    const displayName = post.displayName;
    if (pwd !== pwd2) {
      req.flash("error", "password must be same!");
      res.redirect("/auth/register");
    } else {
      bcrypt.hash(pwd, 10, function(err, hash) {
        // Store hash in your password DB.
        const user = db
          .get("users")
          .find({ email: email })
          .value();
        if (user) {
          user.password = hash;
          user.displayName = displayName;
          db.get("users")
            .find({ id: user.id })
            .assign(user)
            .write();
        } else {
          const user = {
            id: shortid.generate(),
            email: email,
            password: hash,
            displayName: displayName
          };
          db.get("users")
            .push(user)
            .write();
        }
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
      });
    }
  });

  /*
  router.post("/login", (req, res) => {
    const post = req.body;
    const email = post.email;
    const password = post.pwd;
    if (email === authData.email && password === authData.password) {
      req.session.is_logined = true;
      req.session.nickname = authData.nickname;
      req.session.save(function() {
        res.redirect("/");
      });
    } else {
      res.send("who?");
    }
  });
  */
  router.get("/logout", (req, res) => {
    req.logout();
    req.session.save(function() {
      res.redirect("/");
    });
  });
  return router;
};
