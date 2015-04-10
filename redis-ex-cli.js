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
var routes = {
  'select' : require('./includes/select'),
  'server' : require('./includes/server'),
  'keys_regexp' : require('./includes/keys_regexp'),
  'export_data' : require('./includes/export_data'),
  'import_data' : require('./includes/import_data'),
  'delete_keys' : require('./includes/delete_keys'),
  'copy_keys' : require('./includes/copy_keys'),
  'rename_keys' : require('./includes/rename_keys'),
  'hset' : require('./includes/hset'),
  'hdel' : require('./includes/hdel'),
  'hsearch' : require('./includes/hsearch')
};

app.cmd('server :host', 'Connect a redis server.', routes.server);
app.cmd('server :host :port', 'Connect a redis server.', routes.server);
app.cmd('select :index', 'Select the DB with having the specified zero-based numeric index. New connections always use DB 0', routes.select);
app.cmd('keys :regexp', 'List keys up with regular expression', routes.keys_regexp);
app.cmd('keys export :regexp', 'Export particular key-data.', routes.export_data);
app.cmd('keys export :regexp :filename', 'Export particular key-data into the file.', routes.export_data);
app.cmd('keys import :filename', 'Import redis commands file that exported with keys-export command.', routes.import_data);
app.cmd('keys del :regexp', 'Delete multiple keys', routes.delete_keys);
app.cmd('keys copy :regexp :replace', 'Copy multiple keys', routes.copy_keys);
app.cmd('keys rename :regexp :newkey', 'Rename multiple keys', routes.rename_keys);
app.cmd('keys hset :regexp :field :value', 'Set the value for multiple keys', routes.hset);
app.cmd('keys hdel :regexp :field', 'Delete the field from multiple keys', routes.hdel);
app.cmd('keys hsearch :regexp :field :value', 'Find keys that contains the field and the value', routes.hsearch);

app.on('quit', function() {
  process.exit();
});
