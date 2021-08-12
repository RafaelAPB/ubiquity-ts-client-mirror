import { UbiWebsocket, UbiquityClient, NETWORKS, PROTOCOL, WS_CHANNELS, BlockIdentifierItem, BlockItem, TxItem} from "@ubiquity/ubiquity-ts-client";

async function wsApp(): Promise<void> {
  // To create a client supply an access token
  // Optionally a different base path can be provided
  const client = new UbiquityClient("---> Auth Token Here");

  // Call the connect function to create a new websocket
  const ws = client.ws.connect(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);

  const blocksub = ws.subscribe(
    WS_CHANNELS.BLOCK,
    (_ws: UbiWebsocket, block: BlockItem) => {
      console.log(block);
    }
  );

  const blockIdentSub = ws.subscribe(
    WS_CHANNELS.BLOCK_IDENTIFIERS,
    (ws: UbiWebsocket, ident: BlockIdentifierItem) => {
      console.log(ident);
      ws.unsubscribe(blockIdentSub);
    }
  );

  const txSub = ws.subscribe(
    WS_CHANNELS.TX,
    (ws: UbiWebsocket, tx: TxItem) => {
      console.log(tx);
      ws.unsubscribe(txSub);
    },
    { addresses: ["0x78c115F1c8B7D0804FbDF3CF7995B030c512ee78"] }
  );
}

wsApp();
