import {
  UbiWebsocket,
  UbiquityClient,
  NETWORKS,
  PROTOCOL,
  WS_CHANNELS,
  BlockIdentifierItem,
  BlockItem,
  TxItem,
  Subscription,
} from "@ubiquity/ubiquity-ts-client";

let ws: UbiWebsocket;

async function wsApp(): Promise<UbiWebsocket> {
  // To create a client supply an access token
  // Optionally a different base path can be provided
  const client = new UbiquityClient("Auth token");

  // Call the connect function to create a new websocket
  ws = client.websocket(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  await ws.connect();

  // listen for new blocks
  const blocksub: Subscription = {
    type: WS_CHANNELS.BLOCK,
    handler: (_ws: UbiWebsocket, block: BlockItem) => {
      console.log(block);
    },
  };
  await ws.subscribe(blocksub);

  // listen for new blocks identifiers
  const blockIdentSub: Subscription = {
    type: WS_CHANNELS.BLOCK_IDENTIFIERS,
    handler: (ws: UbiWebsocket, ident: BlockIdentifierItem) => {
      console.log(ident);
    },
  };
  await ws.subscribe(blockIdentSub);

  // listen for new transactions filtering based on address and unsubscribing once one new transaction recieved
  const txSub: Subscription = {
    type: WS_CHANNELS.TX,
    handler: (ws: UbiWebsocket, tx: TxItem) => {
      console.log(tx);
      ws.unsubscribe(txSub);
    },
    detail: { addresses: ["0x78c115F1c8B7D0804FbDF3CF7995B030c512ee78"] },
  };
  await ws.subscribe(txSub);

  return Promise.resolve(ws);
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

wsApp().then(() => {
  sleep(60000)
    .then(() => {
      console.log("waiting");
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      ws.close();
    });
});
