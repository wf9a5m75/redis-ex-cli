module.exports = function(request, response, next) {
  var async = require('async'),
      app = request.shell,
      redis = app.set('redis');
  var fs = require('fs'),
      util = require('util');
  var redisCmds = require('../lib/commands');

  if (!redis) {
    response.red('You need connect to the redis server.');
    response.ln();
    response.prompt();
    return;
  }


  request.redis = redis;
  request.useScan = app.set('useScan') || false;

  var commands = [];
  var route = request.shell.routes[request._route_index];
  if (route.command === ":command1 | :command2") {
    // Execute multiple commands

    commands = request.command.split(/(?:\"?\|\")|\|(?!.*\")/);
    commands = commands.map(function(command) {
      return command.trim();
    });
  } else {
    commands.push(request.command);
  }

  commands = commands.map(function(userCommand) {
    var route;
    var idx = -1;
    for (var i = 0; i < request.shell.routes.length; i++) {
      route = request.shell.routes[i];
      if (route.command === ":command1 | :command2") {
        continue;
      }

      if (route.regexp.test(userCommand)) {
        idx = i;
        break;
      }

      if (userCommand.indexOf("keys ") == 0) {
        var keysCmd = userCommand.match(/(keys [^\s]+)/g);
        if (keysCmd &&
            keysCmd.length == 1 &&
            route.command.indexOf(keysCmd) == 0) {
          idx = i;
          break;
        }
      }
    }
    if (idx > -1) {
      route = request.shell.routes[idx];
      return {
        'userCommand': userCommand,
        'command': route.command,
        'middlewares': route.middlewares,
        'regexp': route.regexp,
        'keys': route.keys
      }
    }

    var i = 0;
    var cmdPattern, regexp;
    for (i = 0; i < redisCmds.length; i++) {
      command = redisCmds[i];
      regexp = command.replace(/:[a-z]+/, "([^\s]+)");
      if (userCommand.test(regexp)) {
        matches = command.match(/(:[a-z]+)/g);
        return {
          'userCommand': userCommand,
          'command': command,
          'middlewares': null,
          'regexp': regexp,
          'keys': route.keys
        }
      }
    }

    response.red("[ERROR] Unknown command");
    response.ln();
    response.red(userCommand);
    response.ln();
    response.prompt();
    return;

  });

  console.log(commands);
  response.prompt();
  return;
  async.reduce(commands, null, function(command, cback) {

  }, function(err, results) {
    if (err) {
      response.red("[ERROR]");
      response.red(err);
      response.ln();
      response.prompt();
      return;
    }
    var result = results.pop();

    // Output the result strings
    if (typeof result === "string") {
      response.println(result);
    }

    // Output the result array
    if (util.isArray(result)) {
      result.forEach(function(key) {
        response.println(key);
      });
    }
    response.prompt();
  });

/*
    console.log(route);
    return;

  var route = request.shell.routes[request._route_index];
  var proc = route.middlewares[0];
  console.log(proc.nextMiddleware() == require('./select'));
  return;
  proc(request, function(err, result) {
    if (err) {
      response.red("[ERROR]");
      response.red(err);
      response.ln();
      return;
    }

    response.println('---result')

    // Output the result strings
    if (typeof result === "string") {
      response.println(result);
    }

    // Output the result array
    if (util.isArray(result)) {
      result.forEach(function(key) {
        response.println(key);
      });
    }
    response.prompt();
  });
*/
};
