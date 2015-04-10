module.exports = function(request, response, next) {
  var async = require('async'),
      app = request.shell,
      Redis = require("redis"),
      host, port;

  if (app.redis) {
    app.redis.quit();
  }
  host = request.params.host || "localhost";
  port = request.params.port || 6379;
  app.redis = Redis.createClient(port, host);
  app.set('redis', app.redis);

  app.set('prompt', host + ':' + port + ' >> ');

  app.set('keysCmd', 'keys');
  app.redis.once('ready', function() {

    var versions = app.redis.server_info.versions;
    if (versions && versions.length > 2) {
      if (versions[0] >= 2 && versions[1] >= 8) {
        app.set('keysCmd', 'scan');
      }
    }
  })

  response.prompt();
};
