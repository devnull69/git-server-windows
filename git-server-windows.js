var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var auth = require("http-auth");
var child_process = require("child_process");
var spawn = child_process.spawn;
var zlib = require("zlib");

var port;
var baseURL;
var repoDir;
var repositories;
var defaultUsers;

exports.User = function (config) {
  this.username = config.username;
  this.password = config.password;
};

exports.server = function (config) {
  var config = config || {};
  port = config.port || 8080;
  baseURL = config.baseURL || "/git";
  repoDir = config.repoDir || "repos";
  repositories = config.repositories;
  defaultUsers = config.defaultUsers || [];

  var app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(methodOverride());
  app.use(express.query());

  app.get(baseURL + "/:reponame/info/refs", getInfoRefs);
  app.post(baseURL + "/:reponame/git-receive-pack", checkAuth, postReceivePack);
  app.post(baseURL + "/:reponame/git-upload-pack", postUploadPack);

  app.listen(port, () => {
    console.log("Git Server listening on port " + port + " ...");
  });
};

//
// Middleware
//
function checkAuth(req, res, next) {
  var reponame = req.params.reponame;

  var users = defaultUsers;

  // Die defaultUsers gelten f�r alle Repositories, au�er sie sind in der Liste gesondert aufgef�hrt

  if (repositories != undefined && repositories[reponame] != undefined)
    users = repositories[reponame];

  if (users.length > 0) {
    var basic = auth.basic(
      {
        realm: "Web.",
      },
      (username, password, callback) => {
        console.log(
          "Authenticating user " + username + " for " + reponame + " ..."
        );
        var passed = false;
        for (i = 0; i < users.length; i++) {
          if (
            users[i].username === username &&
            users[i].password === password
          ) {
            passed = true;
            break;
          }
        }
        if (!passed) console.log("Authentication failed");
        callback(passed);
      }
    );
    auth.connect(basic)(req, res, next);
  } else {
    next();
  }
}

//
// Routing
//
function getInfoRefs(req, res) {
  var service = req.query.service;

  var reponame = req.params.reponame;

  console.log("GET " + service + " / " + reponame);

  res.setHeader("Expires", "Fri, 01 Jan 1980 00:00:00 GMT");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
  res.setHeader("Content-Type", "application/x-" + service + "-advertisement");

  var packet = "# service=" + service + "\n";
  var length = packet.length + 4;
  var hex = "0123456789abcdef";
  var prefix = hex.charAt((length >> 12) & 0xf);
  prefix = prefix + hex.charAt((length >> 8) & 0xf);
  prefix = prefix + hex.charAt((length >> 4) & 0xf);
  prefix = prefix + hex.charAt(length & 0xf);
  res.write(prefix + packet + "0000");

  var git = spawn(
    service + ".cmd",
    ["--stateless-rpc", "--advertise-refs", repoDir + "/" + reponame],
    { shell: true }
  );
  git.stdout.pipe(res);
  git.stderr.on("data", (data) => {
    console.log("stderr: " + data);
  });
  git.on("exit", () => {
    res.end();
  });
}

function postReceivePack(req, res) {
  var reponame = req.params.reponame;

  console.log("POST git-receive-pack / " + reponame);

  res.setHeader("Expires", "Fri, 01 Jan 1980 00:00:00 GMT");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
  res.setHeader("Content-Type", "application/x-git-receive-pack-result");

  var git = spawn(
    "git-receive-pack.cmd",
    ["--stateless-rpc", repoDir + "/" + reponame],
    { shell: true }
  );
  req.pipe(git.stdin);
  git.stdout.pipe(res);
  git.stderr.on("data", (data) => {
    console.log("stderr: " + data);
  });
  git.on("exit", () => {
    res.end();
  });
}

function postUploadPack(req, res) {
  var reponame = req.params.reponame;

  console.log("POST git-upload-pack / " + reponame);

  res.setHeader("Expires", "Fri, 01 Jan 1980 00:00:00 GMT");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
  res.setHeader("Content-Type", "application/x-git-upload-pack-result");

  var git = spawn(
    "git-upload-pack.cmd",
    ["--stateless-rpc", repoDir + "/" + reponame],
    { shell: true }
  );
  req.pipe(git.stdin);
  git.stdout.pipe(res);
  git.stderr.on("data", (data) => {
    console.log("stderr: " + data);
  });
}
