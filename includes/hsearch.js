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
      var regexp = new RegExp(request.params.value, "i");
      async.filter(keys, function(key, cback) {
        redis.hget(key, request.params.field, function(err, value) {
          cback(regexp.test(value));
        })
      }, function(results) {
        callback(null, results);
      });
    },
  ], function(err, results) {
    if (err) {
      response.red(err);
      response.ln();
    } else {
      
      response.ln();
      results = results.sort();
      for (var i = 0; i < results.length; i++) {
        response.println(results[i]);
      }
    }
    
    
    response.prompt();
  });
};