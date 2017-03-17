var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var routes = require('./routes');

var app = express();

var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(express.query());

app.get('/', routes.index);

app.get('/git/:reponame/info/refs', routes.getInfoRefs);
app.post('/git/:reponame/git-receive-pack', routes.postReceivePack);
app.post('/git/:reponame/git-upload-pack', routes.postUploadPack);

app.listen(port, () => {
   console.log('Git Server listening on port ' + port + ' ...');
});