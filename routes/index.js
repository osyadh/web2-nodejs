const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

router.get("/", (req, res) => {
  const fmsg = req.flash();
  let feedback = "";
  if (fmsg.success) {
    feedback = fmsg.success[0];
  }
  const title = "Welcome";
  const description = "Hello, Node.js";
  const temList = template.list(req.list);
  const HTML = template.html(
    title,
    temList,
    `
    <div style="color:blue;">${feedback}</div>
    ${description}<img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px">`,
    `
    <h1><a href="/topic/create">create</a>`,
    auth.statusUI(req, res)
  );
  res.send(HTML);
});

module.exports = router;
