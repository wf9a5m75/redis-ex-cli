/**
 * List up keys that matched with regular expressions
 *
 * request {Object}
 * request.redis {Object}  Instance of redis
 * request.shell {Object}  Instance of shell
 * next {Function} callback
 */
module.exports = function(request, next) {
  var async = require('async');
  var app = request.shell,
      redis = request.redis,
      regexp = null;

  async.waterfall([
    //-----------------------------------
    // 1. Create a regular expression
    //-----------------------------------
    function(callback) {
      try {
        regexp = new RegExp(request.params.regexp);
      }catch (e) {
        regexp = null;
      }
      callback(null);
    },

    //-------------------------------------------
    // 2. Create pattern for redis-keys command.
    //-------------------------------------------
    function(callback) {
      var pattern = request.params.regexp;
      pattern = pattern.replace(/^\//, '');
      pattern = pattern.replace(/\/[gim]*$/, '');

      pattern = pattern.replace(/[^A-Za-z0-9\_\-\:].*$/, '*');
      if (pattern == null || pattern === "") {
        pattern = '';
      }
      callback(null, pattern);
    },

    //-----------------------------------
    // 3. pick up keys.
    //-----------------------------------
    function (pattern, callback) {
      if (!request.useScan) {
        redis.keys(pattern, callback);
        return;
      }

      var keysBuffer = [];
      // scan command for redis v2.8 and above.
      var loopCallback = function(error, results) {
        if (error) {
          callback(error, keysBuffer);
        } else {
          keysBuffer = keysBuffer.concat(results[1]);
          if (results[0] != 0) {
            redis.scan(results[0], loopCallback);
          } else {
            callback(null, keysBuffer);
          }
        }
      };

      redis.scan(0, loopCallback);
    },

    //-----------------------------------
    // 4. filter the results.
    //-----------------------------------
    function (keys, callback) {
      if (regexp === null) {
        callback(null, keys);
        return;
      }
      async.filter(keys, function(key, cback) {
        cback(regexp.test(key));
      }, function(results) {
        callback(null, results);
      });
    }

  ], function(err, results) {
    if (!err) {
      results = results.sort();
    }
    next(err, results);
  });
};
