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
  const client = new UbiquityClient("---> Auth Token Here");

  // Call the connect function to create a new websocket
  ws = client.websocket(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  await ws.connect();

  // listen for new blocks
  const blocksub: Subscription = {
    type: WS_CHANNELS.BLOCK,
    handler: (_ws: UbiWebsocket, block: BlockItem) => {
      console.log("Got block %s", block.content.id);
    },
  };
  await ws.subscribe(blocksub);
  
  // listen for new blocks identifiers
  const blockIdentSub: Subscription = {
    type: WS_CHANNELS.BLOCK_IDENTIFIERS,
    handler: (ws: UbiWebsocket, ident: BlockIdentifierItem) => {
      console.log("Got block identity %s", ident.content.id);
    },
  };
  await ws.subscribe(blockIdentSub);

  // listen for new transactions filtering based on address and unsubscribing once one new transaction recieved
  const txSub: Subscription = {
    type: WS_CHANNELS.TX,
    handler: (ws: UbiWebsocket, tx: TxItem) => {
      console.log("Got Tx %s", tx.content.id);
      ws.unsubscribe(txSub);
    },
    detail: { addresses: ["0xeB2629a2734e272Bcc07BDA959863f316F4bD4Cf"]},
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
      console.log("Done");
      ws.terminate();
    })
    .catch((err) => {
      console.log(err);
      ws.close();
    });
});