const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

router.get("/", (req, res) => {
  const title = "Welcome";
  const description = "Hello, Node.js";
  const temList = template.list(req.list);
  HTML = template.html(
    title,
    temList,
    `${description}<img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px">`,
    `<h1><a href="/topic/create">create</a>`,
    auth.statusUI(req, res)
  );
  res.send(HTML);
});

module.exports = router;
