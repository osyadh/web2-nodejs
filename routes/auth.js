const express = require("express");
const router = express.Router();
const template = require("../lib/template");

const authData = {
  email: `ss@asdf.com`,
  password: `111`,
  nickname: `ss`
};

router.get("/login", (req, res) => {
  const title = "WEB - login";
  const temList = template.list(req.list);
  HTML = template.html(
    title,
    temList,
    `
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

router.get("/logout", (req, res) => {
  req.session.destroy(function(err) {
    res.redirect("/");
  });
});

module.exports = router;
