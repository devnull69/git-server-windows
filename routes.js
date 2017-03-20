var child_process = require('child_process');
var spawn = child_process.spawn;

exports.getInfoRefs = (req, res) => {
   
   var service = req.query.service;
   
   var reponame = req.params.reponame;
   
   console.log('GET ' + service + ' / ' + reponame);
   
   res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
   res.setHeader('Content-Type', 'application/x-' + service + '-advertisement');
   
   var packet = "# service=" + service + "\n";
   var length = packet.length + 4;
   var hex = "0123456789abcdef";
   var prefix = hex.charAt(length >> 12 & 0xf);
   prefix = prefix + hex.charAt(length >> 8 & 0xf);
   prefix = prefix + hex.charAt(length >> 4 & 0xf);
   prefix = prefix + hex.charAt(length & 0xf);
   res.write(prefix + packet + '0000');
   
   var git = spawn(service + ".cmd", ['--stateless-rpc', '--advertise-refs', 'repos/' + reponame]);
   git.stdout.pipe(res);
   git.stderr.on('data', (data) => {
      console.log("stderr: " + data);
   });
   git.on('exit', () => {
      res.end();
   });
};

exports.postReceivePack = (req, res) => {

   var reponame = req.params.reponame;

   console.log('POST git-receive-pack / ' + reponame);
   
   res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
   res.setHeader('Content-Type', 'application/x-git-receive-pack-result');

   var git = spawn("git-receive-pack.cmd", ['--stateless-rpc', 'repos/' + reponame]);
   req.pipe(git.stdin);
   git.stdout.pipe(res);
   git.stderr.on('data', (data) => {
      console.log("stderr: " + data);
   });
   git.on('exit', () => {
      res.end();
   });
};

exports.postUploadPack = (req, res) => {

   var reponame = req.params.reponame;

   console.log('POST git-upload-pack / ' + reponame);
   
   res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
   res.setHeader('Content-Type', 'application/x-git-upload-pack-result');

   var git = spawn("git-upload-pack.cmd", ['--stateless-rpc', 'repos/' + reponame]);
   req.pipe(git.stdin);
   git.stdout.pipe(res);
   git.stderr.on('data', (data) => {
      console.log("stderr: " + data);
   });
};

exports.index = (req, res) => {
   res.end('Git server running');
};
































