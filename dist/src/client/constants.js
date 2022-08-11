"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_CHANNELS = exports.SPECIAL_IDENTIFIERS = exports.PROTOCOL = exports.NETWORKS = exports.WS_BASE_URL = exports.BASE_URL = void 0;
exports.BASE_URL = "https://ubiquity.api.blockdaemon.com/v1";
exports.WS_BASE_URL = "wss://ubiquity.api.blockdaemon.com/v1";
exports.NETWORKS = {
    MAIN_NET: "mainnet",
    TEST_NET: "testnet",
    ROPSTEN: "ropsten",
};
exports.PROTOCOL = {
    ALGORAND: "algorand",
    BITCOIN: "bitcoin",
    BITCOIN_CASH: "bitcoincash",
    CELO: "celo",
    DIEM: "diem",
    DOGECOIN: "dogecoin",
    ETHEREUM: "ethereum",
    LITECOIN: "litecoin",
    NEAR: "near",
    OASIS: "oasis",
    POLKADOT: "polkadot",
    RIPPLE: "xrp",
    SOLANA: "solana",
    STELLAR: "stellar",
    TERRA: "terra",
    TEZOS: "tezos",
};
exports.SPECIAL_IDENTIFIERS = {
    CURRENT: "current",
};
exports.WS_CHANNELS = {
    TX: "ubiquity.txs",
    BLOCK_IDENTIFIERS: "ubiquity.block_identifiers",
};
