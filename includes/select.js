module.exports = function(request, response, next) {
  var async = require('async'),
      app = request.shell,
      redis = app.settings.redis;
  var fs = require('fs');
 
  async.waterfall([
    function(callback) {
      response.println("select DB index : " + request.params.index);
      redis.select(request.params.index, callback);
    }
  ], function(err) {
    if (err) {
      response.red(err);
      response.ln();
    }
    
    response.prompt();
  });
};
