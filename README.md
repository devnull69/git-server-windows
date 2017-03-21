# git-server-windows: a git http server specifically for Windows

`git-server-windows` is a simple, easy to configure git server specifically designed for Windows. It works around the common SPAWN error regarding the execution of `git-receive-pack`. It supports authentication.

## Precondition

git for Windows needs to be installed on the machine prior to running `git-server-windows`

## Installation

     # npm install git-server-windows

## Prepare the environment

`git-server-windows` uses two batch files in order to execute certain git commands. Those batch files need to be located in the path you're running your git server.

     # copy node_modules/git-server-windows/*.cmd .

The files are called `git-receive-pack.cmd` and `git-upload-pack.cmd`

After copying those files, your project folder should at least contain the following elements:

     index.js                // your server implementation
     node_modules
     git-receive-pack.cmd
     git-upload-pack.cmd

### Initializing bare git repositories

Every git repository on your server must be initialized as a bare repository before it can be used with the server.

First create a subfolder for the repositories inside your project folder:

     # md repos
     # cd repos

Then (for each planned repository) create a subfolder inside the repos folder:

     # md myRepository
     # cd myRepository

     # git init --bare

## Create the server code

For a basic server put this into your `index.js`:

```js
// This is a simple example for a basic git server with no authentication

var Git = require('git-server-windows');

Git.server();
```

## Starting the git server

     # node index.js
     Git Server listening on port 8080 ...

## Test the git server with a git client

In this example, let's assume you already have a local git repository which you want to store on your newly created git server. You can do this by adding a `remote` to your git project which points to the server:

     # git remote add myserver http://xxx.xxx.xxx.xxx:8080/git/myRepository

and then pushing your code to this remote:

     # git push -u myserver master

## Advanced configuration

The git server can be configured using a parameter object on creation:

```js
{
   port: 8080,
   baseURL: '/git',
   repoDir: 'repos',
   defaultUsers: [],
   repositories: OBJECT
}
```

By default the server will be started on port 8080, using `/git` as the base URL, `repos` as the subfolder name of your repositories and an empty user list. All of the subfolders of `repos` will be used as repositories.

### baseURL

The `baseURL` configuration parameter is used to determine the base URL part of your git URL.

Example: If you want to access your server as `http://xxx.xxx.xxx.xxx:8080/mygit/REPOSITORYNAME` you'd have to set

```js
baseURL: '/mygit'
```

### repoDir

The `repoDir` configuration parameter defines the name of the project subfolder that contains the git repositories.

### defaultUsers

`defaultUsers` is an array of `Git.User` objects. If you specify such a list, the repository users will have to authenticate before they can `push` to the repository:

```js
var myUser = new Git.User({
   username: 'myusername',
   password: 'mypassword'
});

Git.server({ defaultUsers: [myUser] });
```

### repositories

By default, every subfolder of the folder specified by `repoDir` will be used as a repository with the users specified by `defaultUsers`.

If you want to change the list of users that can authenticate themselves against a repository on a per-repository basis, you can use the `repositories` configuration parameter:

```js
Git.server({
   defaultUsers: [myUser],
   repositories: {
      'myOtherRepository' : []
   }
});
```

In this example, users need to authenticate to every repository but `myOtherRepository`

```js
var myUser = new Git.User({
   username: 'myusername',
   password: 'mypassword'
});

var anotherUser = new Git.User({
   username: 'myotherusername',
   password: 'myotherpassword'
});

Git.server({
   defaultUsers: [myUser],
   repositories: {
      'myOtherRepository' : [anotherUser]
   }
});
```

In this example, the user `myUser` can authenticate against every repository but `myOtherRepository` which requires `anotherUser` to authenticate.
