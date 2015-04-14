module.exports = function(request, next) {
  var async = require('async'),
      sprintf = require('sprintf').sprintf,
      app = request.shell,
      redis = request.redis,
      response = request.response;

  async.waterfall([
    function (callback) {
      require('./keys_regexp')(request, callback);
    },

    function(keys, callback) {
      console.log("---Keys");
      console.log(keys);
      var regexp = new RegExp(request.params.regexp);

      async.map(keys, function(key, cback) {
        cback(null, {
          'orgKey' : key,
          'newKey' : key.replace(regexp, request.params.replace)
        });
      }, callback);
    },

    function(cmds, callback) {
      if (!app || !app.isShell) {
        callback(null, keys);
        return;
      }

      //-----------------
      // Confirm to user
      //-----------------
      cmds = cmds.sort(function(a, b) {
        return a.orgKey - b.orgKey;
      });
      cmds.forEach(function(cmd) {
        response.blue("[copy]" + cmd.orgKey + ' --> ' + cmd.newKey);
        response.ln();
      });

      request.question('Do you want to copy [N]/Y', function(answer) {
        answer = answer.toLowerCase();
        if (answer === "yes" || answer === "y") {
          callback(null, cmds);
        } else {
          callback('Aborting by user.');
        }
      });
    },

    function(cmds, callback) {
      async.each(cmds, function(info, cback) {
        redis.hgetall(info.orgKey, function(err, data) {
          if (err) {
            cback(err);
            return;
          }
          redis.hmset(info.newKey, data, cback);
        });
      }, callback);
    }
  ], next);
};
