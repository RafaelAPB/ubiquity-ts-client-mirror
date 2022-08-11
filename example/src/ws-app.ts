import {
  UbiWebsocket,
  UbiquityClient,
  NETWORKS,
  PROTOCOL,
  WS_CHANNELS,
  BlockIdentifierItem,
  TxItem,
  Subscription,
} from "@ubiquity/ubiquity-ts-client";

let ws: UbiWebsocket;

async function wsApp(): Promise<void> {
  // To create a client supply an access token
  // Optionally a different base path can be provided
  const client = new UbiquityClient("---> Auth Token Here");

  // Call the connect function to create a new websocket
  ws = client.websocket(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  await ws.connect();
  

 
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