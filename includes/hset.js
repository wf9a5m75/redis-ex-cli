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
      if (app.isShell) {
        keys.forEach(function(key) {
          response.blue("[hset]" + key);
          response.ln();
        });

        request.question('Do you want to set values [N]/Y', function(answer) {
          answer = answer.toLowerCase();
          if (answer === "yes" || answer === "y") {
            callback(null, keys);
          } else {
            callback('Aborting by user.');
          }
        });
      } else {
        callback(null, keys);
      }
    },

    function(keys, callback) {
      async.each(keys, function(key, cback) {
        redis.hset(key, request.params.field, request.params.value, cback);
      }, callback);
    }
  ], function(err) {
    if (typeof next === "function") {
      next(err);
      return;
    }
    if (err) {
      response.red(err);
      response.ln();
    }

    response.prompt();
  });
};
