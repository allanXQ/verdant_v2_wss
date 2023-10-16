require("dotenv").config();
const WebSocket = require("ws");

const API_KEY = process.env.BINANCEAPIKEY;
const API_SECRET = process.env.BINANCEAPISECRET;

// optionally override the logger
const binanceClient = () => {
  return binanceWs;
};

module.exports = binanceClient;
