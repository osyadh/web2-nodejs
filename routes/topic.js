const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const db = require("../lib/db");
const shortid = require("shortid");

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
  // 파일작성방법
  // fs.writeFile(`./topic/${title}`, description, "utf8", err => {
  //   res.redirect(`/topic/${title}`);
  // });

  // lowdb
  const sid = shortid.generate();
  db.get("topics")
    .push({
      id: sid,
      title: title,
      description: description,
      user_id: req.user.id
    })
    .write();
  res.redirect(`/topic/${sid}`);
});

router.get("/update/:pageId", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  const topic = db
    .get("topics")
    .find({ id: req.params.pageId })
    .value();
  if (topic.user_id !== req.user.id) {
    return res.redirect("/");
  }
  const title = topic.title;
  const description = topic.description;
  const temList = template.list(req.list);
  const HTML = template.html(
    "",
    temList,
    `
          <form action="/topic/update" method="post">
          <input type="hidden" name="id" value=${topic.id}>
          <p><input type="text" name="title" value=${title}></p>
          <p><textarea name="description">${description}</textarea></p>
          <p><input type="submit"></p>
          </form>
          `,
    `<h1><a href="/topic/create">create</a> <a href="/topic/update/${
      topic.id
    }">update</a>`,
    auth.statusUI(req, res)
  );
  res.send(HTML);
});

router.post("/update", (req, res) => {
  const post = req.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  const topic = db
    .get("topics")
    .find({ id: id })
    .value();
  // console.log(topic);
  db.get("topics")
    .find({ id: id })
    .assign({
      title: title,
      description: description
    })
    .write();
  res.redirect(`topic/${topic.id}`);
  // fs.rename(`./topic/${id}`, `./topic/${title}`, err => {
  //   fs.writeFile(`./topic/${title}`, description, "utf8", err => {
  //     res.redirect(`/topic/${title}`);
  //   });
  // });
});

router.post("/delete", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  const post = req.body;
  const id = post.id;
  const topic = db
    .get("topics")
    .find({ id: id })
    .value();
  if (topic.user_id !== req.user.id) {
    return res.redirect("/");
  }
  db.get("topics")
    .remove({ id: id })
    .write();
  return res.redirect("/");

  // fs.unlink(`./topic/${filteredId}`, err => {
  //   res.redirect("/");
  // });
});

router.get("/:pageId/", (req, res, next) => {
  const topic = db
    .get("topics")
    .find({ id: req.params.pageId })
    .value();
  const user = db
    .get("users")
    .find({ id: topic.user_id })
    .value();
  temList = template.list(req.list);
  const sanitizedTitle = sanitizeHtml(topic.title);
  const sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ["h1"]
  });
  HTML = template.html(
    sanitizedTitle,
    temList,
    sanitizedDescription,
    `<h1><a href="/topic/create">create</a> 
             <a href="/topic/update/${topic.id}">update</a> 
             <form action="/topic/delete" method="post">
              <input type="hidden" name="id" value=${topic.id}>
              <input type="submit" value="delete">
             </form>
             <p>By ${user.displayName}</p>
             `,
    auth.statusUI(req, res)
  );
  res.send(HTML);
});

module.exports = router;
