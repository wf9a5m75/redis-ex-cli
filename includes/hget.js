module.exports = function(request, response, next) {
  var async = require('async'),
      sprintf = require('sprintf').sprintf,
      Table = require('cli-table'),
      app = request.shell,
      redis = app.settings.redis,
      table = null;

  if (app.isShell) {
    table = new Table({
      head: ["", request.params.field]
    });
  }

  async.waterfall([
    function (callback) {
      require('./keys_regexp')(request, callback);
    },

    function(keys, callback) {
      async.mapSeries(keys, function(key, cback) {
        redis.hget(key, request.params.field, function(error, value) {
          if (error) {
            cback(error);
            return;
          }
          if (app.isShell) {
            table.push({
              key: [value]
            });
          }
          cback(null, {
            key: key,
            value: value
          });
        });
      }, callback);
    }
  ], function(err, results) {
    if (typeof next === "function") {
      next(err, results);
      return;
    }

    if (err) {
      response.red(err);
      response.ln();
    }

    response.println(table.toString());
    response.prompt();
  });
};
