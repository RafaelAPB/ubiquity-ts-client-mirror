export const BASE_URL = "https://ubiquity.api.blockdaemon.com/v2";
export const WS_BASE_URL = "wss://ubiquity.api.blockdaemon.com/v2/";


export const NETWORKS = {
  MAIN_NET: "mainnet",
  TEST_NET: "testnet",
};

export const PROTOCOL = {
  ALGORAND: "algorand",
  BITCOIN: "bitcoin",
  CELO: "celo",
  DIEM: "diem",
  ETHEREUM: "ethereum",
  OASIS: "oasis",
  POLKADOT: "polkadot",
  RIPPLE: "ripple",
};

export const SPECIAL_IDENTIFIERS = {
  CURRENT: "current",
};

export const WS_CHANNELS = {
  TX: "ubiquity.txs",
  BLOCK: "ubiquity.block",
  BLOCK_IDENTIFIERS: "ubiquity.block_identifiers",
};
