/**
 * Select database index
 *
 * request {Object}
 * request.response {Object} Instance of response
 * request.redis {Object}  Instance of redis
 * request.shell {Object}  Instance of shell
 * next {Function} callback
 */
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
      var regexp = new RegExp(request.params.regexp);

      async.map(keys, function(key, cback) {
        cback(null, {
          'orgKey' : key,
          'newKey' : key.replace(regexp, request.params.replace)
        });
      }, callback);
    },

    function(cmds, callback) {
      if (app && !app.isShell) {
        callback(null, keys);
        return;
      }

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
  ], next);
};
