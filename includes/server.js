module.exports = function(request, response, next) {
  var app = request.shell,
      Redis = require("redis");
  
  if (app.redis) {
    app.redis.quit();
  }
  app.redis = Redis.createClient(
     request.params.port || 6379,
     request.params.host || "localhost");
  app.set('redis', app.redis);
  
  app.set('prompt', request.params.host + ' >>');
  response.prompt();
};