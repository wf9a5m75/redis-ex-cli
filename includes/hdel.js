module.exports = function(request, response, next) {
  var async = require('async'),
      app = request.shell,
      redis = app.settings.redis;
  var fs = require('fs');
  
  async.waterfall([
    function (callback) {
      require('./keys_regexp')(request, callback);
    },
    
    function(keys, callback) {
      if (app.isShell) {
        keys = keys.sort();
        keys.forEach(function(key) {
          response.blue("[hdel]" + key);
          response.ln();
        });
        
        request.question('Do you want to delete [N]/Y', function(answer) {
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
        redis.hdel(key, request.params.field, cback);
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