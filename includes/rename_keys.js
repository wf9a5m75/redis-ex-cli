module.exports = function(request, response, next) {
  var async = require('async'),
      sprintf = require('sprintf').sprintf,
      app = request.shell,
      redis = app.settings.redis;
  var fs = require('fs');
  
  async.waterfall([
    function (callback) {
      require('./keys_regexp')(request, callback);
    },
    
    function(keys, callback) {
      var regexp = new RegExp(request.params.regexp);
      
      async.map(keys, function(key, cback) {
        cback(null, {
          'orgKey' : key,
          'newKey' : key.replace(regexp, request.params.replace)
        });
      }, callback);
    },
    
    function(cmds, callback) {
      if (app.isShell) {
        cmds = cmds.sort(function(a, b) {
          return a.orgKey - b.orgKey;
        });
        cmds.forEach(function(cmd) {
          response.blue("[rename]" + cmd.orgKey + ' --> ' + cmd.newKey);
          response.ln();
        });
        
        request.question('Do you want to rename [N]/Y', function(answer) {
          answer = answer.toLowerCase();
          if (answer === "yes" || answer === "y") {
            callback(null, cmds);
          } else {
            callback('Aborting by user.');
          }
        });
      } else {
        callback(null, keys);
      }
    },
    
    function(cmds, callback) {
      async.each(cmds, function(info, cback) {
        redis.rename(info.orgKey, info.newKey, function(err, data) {
          if (err) {
            cback(err);
            return;
          }
          cback(null);
        });
      }, callback);
    }
  ], function(err) {
    if (err) {
      response.red(err);
      response.ln();
    }
    
    response.prompt();
  });
};