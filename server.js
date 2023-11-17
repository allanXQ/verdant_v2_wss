const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Server } = require("socket.io");
const DBconn = require("./config/dbConn");
const { coinLabelMap } = require("./config");
const logger = require("./utils/logger");

const port = process.env.WSPORT || 2000;

const app = express();
const server = http.createServer(app);

const wss = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.APP_URL],
    credentials: true,
  },
});

const binanceClients = {};
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 1000;
let reconnectAttempts = 0;

wss.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  function createBinanceClient(endpoint, callback) {
    if (binanceClients[socket.id]) {
      binanceClients[socket.id].close();
    }

    const binanceClient = new WebSocket(endpoint);
    binanceClients[socket.id] = binanceClient;

    binanceClient.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        callback(data);
      } catch (error) {
        console.error("JSON parse error:", error);
      }
    };

    binanceClient.onerror = (error) => {
      console.error("WebSocket error:", error);
      logger.error(error);

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(
          () => createBinanceClient(endpoint, callback),
          RECONNECT_INTERVAL
        );
        reconnectAttempts += 1;
      } else {
        socket.emit("error", { message: "WebSocket error" });
      }
    };
  }

  socket.on("requestKlines", (data) => {
    const { assetName, klineInterval } = data;
    const tradingPair = coinLabelMap[assetName]?.toLowerCase();
    console.log(tradingPair, assetName, klineInterval);

    if (!tradingPair) {
      return socket.emit("error", { message: "Invalid asset name" });
    }

    const url = `wss://stream.binance.com:9443/ws/${tradingPair}@kline_${klineInterval}`;

    createBinanceClient(url, (data) => {
      const candlestick = {
        time: data.k.t,
        open: parseFloat(data.k.o),
        high: parseFloat(data.k.h),
        low: parseFloat(data.k.l),
        close: parseFloat(data.k.c),
      };
      console.log(candlestick);
      socket.emit("klineData", { candlestick });
    });
  });

  socket.on("requestPrice", (data) => {
    const { assetName } = data;
    const tradingPair = coinLabelMap[assetName]?.toLowerCase();

    if (!tradingPair) {
      return socket.emit("error", { message: "Invalid asset name" });
    }

    const url = `wss://stream.binance.com:9443/ws/${tradingPair}@ticker`;

    createBinanceClient(url, (data) => {
      const price = parseFloat(data.c);
      socket.emit("priceData", { price });
    });
  });

  socket.on("disconnect", () => {
    if (binanceClients[socket.id]) {
      binanceClients[socket.id].close();
      delete binanceClients[socket.id];
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const pingInterval = 840000; // 14 minutes in milliseconds

function pingSelf() {
  axios
    .get("https://verdantwss.onrender.com/")
    .then((response) => {
      console.log("Service pinged successfully:", response.status);
    })
    .catch((error) => {
      console.error("Error pinging service:", error);
    });
}

// Set up the interval to ping your service every 14 minutes
setInterval(pingSelf, pingInterval);

DBconn(server, port);
