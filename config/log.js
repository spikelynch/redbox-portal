/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */


var winston = require('winston');

var logger = new(winston.Logger)({
  transports: [
    new (winston.transports.Console)({}),
    new (winston.transports.File)({
      filename: 'logs/redbox.log',
      level: 'debug',
      json: false,
      colorize: false
    })
  ]
});

module.exports.log = {
    level: 'info',
    custom: logger
};
