var Git = require('./git-server-windows');

var myUser = new Git.User({
   username: "xxxxxxxxxxxxxxxxx",
   password: "yyyyyyyyy"
});

Git.server({
   defaultUsers : [myUser]
});
