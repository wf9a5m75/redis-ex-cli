#!/usr/bin/env node

var shell = require('shell'),
    app = new shell({chdir: __dirname });

process.chdir(process.env.PWD);

//----------------------------
// Configureation for shell
//----------------------------
app.configure(function() {
  app.use(function(request, response, next) {
    app.redis = null;
    app.set('useScan', false);
    next();
  });
  app.use(shell.history({
    shell: app
  }));
  app.use(shell.completer({
    shell: app
  }));
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));

  app.set('prompt', '(disconnect) >>');
});


//----------------------------
// Routing
//----------------------------
var shell_interface = require('./lib/shell_interface');
var serverCmd = require('./includes/server.js');

app.cmd('server :host', 'Connect a redis server.', serverCmd);
app.cmd('server :host :port', 'Connect a redis server.', serverCmd);
app.cmd('select :index', 'Select the DB with having the specified zero-based numeric index. New connections always use DB 0', shell_interface);
app.cmd('keys :regexp', 'List keys up with regular expression', shell_interface);
app.cmd('keys export :regexp', 'Export particular key-data.', shell_interface);
app.cmd('keys export :regexp :filename', 'Export particular key-data into the file.', shell_interface);
app.cmd('keys import :filename', 'Import redis commands file that exported with keys-export command.', shell_interface);
app.cmd('keys del :regexp', 'Delete multiple keys', shell_interface);
app.cmd('keys copy :regexp :replace', 'Copy multiple keys', shell_interface);
app.cmd('keys rename :regexp :newkey', 'Rename multiple keys', shell_interface);
app.cmd('keys hget :regexp :field', 'Display a value table of :field', shell_interface);
app.cmd('keys hset :regexp :field :value', 'Set the value for multiple keys', shell_interface);
app.cmd('keys hdel :regexp :field', 'Delete the field from multiple keys', shell_interface);
app.cmd('keys hsearch :regexp :field :value', 'Find keys that contains the field and the value', shell_interface);
app.cmd(':command1 | :command2', shell_interface);
app.cmd(':command1', shell_interface);

app.on('quit', function() {
  process.exit();
});
