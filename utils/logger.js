const winston = require("winston");

const logger = winston.createLogger({
  level: "debug", // Set to a lower level to capture more detailed logs
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
    winston.format.errors({ stack: true }), // Log stack traces
    winston.format.json(), // Log in JSON format
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    ), // Print logs in this format
    winston.format.colorize()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/error.json",
      level: "error",
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors to console transport
        winston.format.simple() // Simple format for console transport
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.json" }),
  ],
});

module.exports = logger;
