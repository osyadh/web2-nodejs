const express = require("express");
const router = express.Router();
const template = require("../lib/template");

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
