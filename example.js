var Git = require('git-server-windows');

var myUser = new Git.User({
   username: "xxxxxxxxxxxxxxxxxx",
   password: "yyyyyyyyyyyy"
});

Git.server({
   defaultUsers : [myUser]
});
