module.exports = function(request, response, next) {
  var async = require('async'),
      sprintf = require('sprintf').sprintf,
      LineByLineReader = require('line-by-line'),
      app = request.shell,
      redis = app.settings.redis;
  var fs = require('fs');
  var commands = require('redis/lib/commands');

  async.waterfall([
    function (callback) {
      fs.exists(request.params.filename, function(exists) {
        if (!exists) {
          callback("There is no file: " + request.params.filename);
        } else {
          callback(null);
        }
      });
    },

    function(callback) {
      var buffer = [];

      var lr = new LineByLineReader(request.params.filename, {
        encoding: 'utf8',
        skipEmptyLines: true
      });
      lr.on('error', function(err) {
        callback(err);
      });

      lr.on('line', function(line) {
        buffer.push(line);
      });

      lr.on('end', function () {
        callback(null, buffer);
      });
    },

    function(lines, callback) {

      async.map(lines, function(line, cback) {
        // (?:\"?\s\")
        // HSET logs:2015:0409:07-09-22 "test" "[{"hoge":"hogehoge"}]"
        //
        // HSET logs:2015:0409:07-09-22
        // "test"
        // "[{"hoge":"hogehoge"}]"

        // (?!.*\") : "TEST 1234"
        // HSET logs:2015:0409:07-09-22 "test" "TEST 1234"
        //
        // HSET logs:2015:0409:07-09-22
        // "test"
        // "TEST 1234"
        var columns = line.split(/(?:\"?\s\")|\s(?!.*\")/);
        var tmp = (columns.shift()).split(/\s/);
        columns = tmp.concat(columns);

        var redisCmd = (columns[0] || "").toLowerCase();
        if (!redisCmd in commands) {
          cback("'" + redisCmd + "' is unknown command: " + line);
          return;
        }
        columns[0] = columns[0].toLowerCase();
        columns = columns.map(function(column) {
          return column.replace(/^\"/, "").replace(/([^\\])\"$/g, "$1");
        });

        cback(null, columns);
      }, function(error, results) {
        if (error) {
          callback(error);
          return;
        }
        redis.multi(results).exec(function(err, replies) {

          lines.forEach(function(line, idx) {
            response.println(line);
            response.println("  " + replies[idx].toString());
          });
          callback(null, lines);

        });
      });
    }

  ], function(err, results) {
    if (err) {
      response.red(err);
      response.ln();
    }
    response.println("---done");
    response.prompt();
  });
};
