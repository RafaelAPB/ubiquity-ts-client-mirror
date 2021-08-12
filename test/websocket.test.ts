import { UbiquityClient, NETWORKS, PROTOCOL, WS_CHANNELS, UbiWebsocket } from "../src/client";
import { BlockItem } from "../src/client";
import WS from "jest-websocket-mock";
import * as ethBlock from "./data/eth_block.json";

const WS_BASE_URL = "ws://127.0.0.1:8088";
const client = new UbiquityClient("authtoken", null, WS_BASE_URL);

test("Websocket test subscribe/unsubscribe", async () => {
  const server = new WS(WS_BASE_URL+ "/ethereum/mainnet/websocket", { jsonProtocol: true });
  const ws = client.ws.connect(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  await server.connected;
  let sub;

  const response = new Promise((resolve) => { 
    sub = ws.subscribe(WS_CHANNELS.BLOCK, (instance: UbiWebsocket, event: BlockItem)=>{
      resolve(event.content);
    });
  });
  
  await expect(server).toReceiveMessage({
    "id": 1,
    "method": "ubiquity.subscribe",
    "params": {
      "channel": "ubiquity.block",
      "detail": {}
    }
  });

  server.send({
    "id": 1,
    "result": {
      "subID": 123
    }
  });

  server.send(
    {
      method: "ubiquity.subscription",
      params: {
        items: [
          {
            subID: 123,
            channel: "ubiquity.block",
            revert: false,
            content: ethBlock
          }
        ]
      }
    }
  );
 
  const block = await response;
  expect(block).toEqual(ethBlock);

  ws.unsubscribe(sub);
  await expect(server).toReceiveMessage({
    id: 2,
    method: "ubiquity.unsubscribe",
    params: {
      channel: "ubiquity.block",
      subID: 123,
    },
  });

  server.error();
  await server.closed;

  //client should try
  await server.connected;
});

afterEach(() => {
  WS.clean();
});