const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const db = require("./lib/db");

app.use(helmet());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "assdalkfjsdlkf#$%#$%#$",
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  })
);
app.use(flash());
const passport = require("./lib/passport")(app);

app.get("*", (req, res, next) => {
  req.list = db.get("topics").value();
  next();
});

const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));

/*
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");

var app = http.createServer(function(req, res) {
  var _url = req.url;
  var querytopic = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (querytopic.id === undefined) {
    } else {

    } else if (pathname === "/create") {
  } else if (pathname === "/create_process") {
  } else if (pathname === "/update") {
  } else if (pathname === "/update_process") {
  } else if (pathname === "/delete_process") {
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
app.listen(3000);
*/
