var git = require('./git-server-windows');

var thomas = new git.User({
   username: "thomas.theiner@gmx.de",
   password: "ngc64738"
});

git.server({
   defaultUsers : [thomas],
   repositories: {
      "node_remotegit" : []
   }
});