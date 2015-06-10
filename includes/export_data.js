module.exports = function(request, response, next) {
  var async = require('async'),
      sprintf = require('sprintf').sprintf,
      app = request.shell,
      redis = app.settings.redis;
  var fs = require('fs'),
      ProgressBar = require('progress'),
      progress;
    
  async.waterfall([
    function (callback) {
      require('./keys_regexp')(request, callback);
    },
    
    function(keys, callback) {
      bar = new ProgressBar(' exporting [:bar] :percent(:current/:total) :etas', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: keys.length
      });
      async.reduce(keys, [], function(memo, key, cback) {
        redis.hgetall(key, function(err, data) {
          if (err) {
            bar.tick();
            cback(null, memo);
            return;
          }
          var fields = Object.keys(data),
              value;
          
          fields.forEach(function(field) {
            value = data[field];
            if (!value) {
              value = '';
            } else {
              value = value.replace(/"/g, "\"");
            }
            memo.push(sprintf('HSET %s "%s" "%s"', key, field, value));
          });
          bar.tick();
          cback(null, memo);
        });
      }, callback);
    },
    
    function(results, callback) {
      if (request.params.filename) {
        fs.writeFile(request.params.filename, results.join("\n"), function(err) {
          callback(err, results);
        }); 
      } else {
        callback(null, results);
      }
    }
    
  ], function(err, results) {
    if (err) {
      response.red(err);
      response.ln();
    } else {
      if (!request.params.filename) {
        results.forEach(function(result) {
          response.println(result);
        });
      }
    }
    
    response.prompt();
  });
};
