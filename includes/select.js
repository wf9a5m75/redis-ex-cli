/**
 * Select database index
 *
 * request {Object}
 * request.redis {Object}  Instance of redis
 * request.params.index {Number}  Database index
 * next {Function} callback
 */
module.exports = function(request, next) {
  request.redis.select(request.params.index, function(err) {
    if (err) {
      next(err);
      return;
    }

    next(null, "select DB index : " + request.params.index);
  });
};
