const { coinLabelMap, klineIntervals } = require("./tradeConfig");

const roles = {
  admin: "a048f5",
  user: "03e4ab",
};

const withdrawalModes = {
  Stripe: "Stripe",
  Mpesa: "Mpesa",
};

const withdrawalStatus = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
};

const orderTypes = {
  Buy: "Buy",
  Sell: "Sell",
  buyLimit: "buyLimit",
  sellLimit: "sellLimit",
};

const orderStatus = {
  Pending: "Pending",
  Fulfilled: "Fulfilled",
  Cancelled: "Cancelled",
};

const WalletConfig = {
  minDeposit: 10,
  maxDeposit: 100000,
  minWithdrawal: 10,
  maxWithdrawal: 100000,
  withdrawalFee: 0,
  depositFee: 0,
  withdrawalFeePercentage: 0,
  depositFeePercentage: 0,
};

module.exports = {
  roles,
  withdrawalModes,
  withdrawalStatus,
  orderTypes,
  orderStatus,
  WalletConfig,
  coinLabelMap,
  klineIntervals,
};
