const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");

router.get("/create", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  const title = "WEB - create";
  const temList = template.list(req.list);
  HTML = template.html(
    title,
    temList,
    `
        <form action="/topic/create" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>
      `,
    "",
    auth.statusUI(req, res)
  );
  res.send(HTML);
});

router.post("/create", (req, res) => {
  /* 
    let body = "";
    req.on("topic", function(topic) {
      body += topic;
    });
    req.on("end", function() {
      const post = qs.parse(body);
      const title = post.title;
      const description = post.description;
      fs.writeFile(`topic/${title}`, description, "utf8", err => {
        res.redirect(`/page/${title}`);
      });
    });
    body-parser 미들웨어가 req에 body를 부여.
    그로 인해 위의 긴 코드가 아래의 간결한 코드로 바뀜.
    */
  const post = req.body;
  const title = post.title;
  const description = post.description;
  fs.writeFile(`./topic/${title}`, description, "utf8", err => {
    res.redirect(`/topic/${title}`);
  });
});

router.get("/update/:pageId", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  temList = template.list(req.list);
  const title = req.params.pageId;
  const filteredId = path.parse(title).base;
  fs.readFile(`./topic/${filteredId}`, "utf8", function(err, description) {
    HTML = template.html(
      "",
      temList,
      `
          <form action="/topic/update" method="post">
          <input type="hidden" name="id" value=${title}>
          <p><input type="text" name="title" value=${title}></p>
          <p><textarea name="description">${description}</textarea></p>
          <p><input type="submit"></p>
          </form>
          `,
      `<h1><a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
      auth.statusUI(req, res)
    );
    res.send(HTML);
  });
});

router.post("/update", (req, res) => {
  const post = req.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`./topic/${id}`, `./topic/${title}`, err => {
    fs.writeFile(`./topic/${title}`, description, "utf8", err => {
      res.redirect(`/topic/${title}`);
    });
  });
});

router.post("/delete", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  const post = req.body;
  const id = post.id;
  const filteredId = path.parse(id).base;
  fs.unlink(`./topic/${filteredId}`, err => {
    res.redirect("/");
  });
});

router.get("/:pageId/", (req, res, next) => {
  temList = template.list(req.list);
  const title = req.params.pageId;
  const filteredId = path.parse(title).base;
  fs.readFile(`./topic/${filteredId}`, "utf8", function(err, description) {
    if (!err) {
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"]
      });
      HTML = template.html(
        sanitizedTitle,
        temList,
        sanitizedDescription,
        `<h1><a href="/topic/create">create</a> 
             <a href="/topic/update/${sanitizedTitle}">update</a> 
             <form action="/topic/delete" method="post">
              <input type="hidden" name="id" value=${sanitizedTitle}>
              <input type="submit" value="delete">
             </form>`,
        auth.statusUI(req, res)
      );
      res.send(HTML);
    } else {
      next(err);
    }
  });
});

module.exports = router;
