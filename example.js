var git = require('./git-server-windows');

var myUser = new git.User({
   username: "xxxxxxxxxxxxxxxxx",
   password: "yyyyyyyyy"
});

git.server({
   defaultUsers : [myUser]
});
