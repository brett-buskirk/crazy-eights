// CONSTANTS FOR COLOR-CODING
const green = '\033[32m';
const yellow = '\033[33m';
const magenta = '\033[35m';
const def = '\033[39m';

// FORMAT CONSOLE LOG
function serverlog(fclr, lclr, msg) {
  console.log(fclr + '** Server Log **' + def + ' [' + new Date() + '] ' + lclr + '"' + msg + '"' + def);
}

// RETURN CONFIGURABLE LOGGER MIDDLEWARE
function setup(format) {
  const regex = /:(\w+)/g;

  // Specific call for starting server
  if (format.match(regex).includes(':start')) {
      const port = format.match(/:port=(\d+)/).slice(1);
      serverlog(magenta, green, 'Server up and running on port ' + port);

  } else {
    // Return logger middleware that allows configurable methods of the request
    // object to be passed and thus logged
    return function logger(req, res, next) {
      const str = format.replace(regex, function(match, property) {
        return req[property];
      });
      serverlog(yellow, green, str);
      next();
    }
  }
}

module.exports = setup;