import { UbiquityClient, NETWORKS, PROTOCOL, WS_CHANNELS, UbiWebsocket } from "../src/client";
import { BlockItem } from "../src/client";
 
import * as ethBlock from "./data/eth_block.json";
import   WebSocket  from "ws";

const WS_BASE_URL = "ws://127.0.0.1:8088/";
const client = new UbiquityClient("authtoken", null, WS_BASE_URL);

test("Websocket test subscribe/unsubscribe", async () => {

  const server = new WebSocket.Server({host:"127.0.0.1", port: 8088 , path:"/ethereum/mainnet/websocket"});

  server.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
      console.log("received: %s", message);
    });
    ws.on("error", function incoming(message) {
      console.log("received: %s", message);
    });
    ws.send("something");
  });
 

  const ws = client.ws.connect(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
 
  let sub;

  const response = new Promise((resolve) => { 
    sub = ws.subscribe(WS_CHANNELS.BLOCK, (instance: UbiWebsocket, event: BlockItem)=>{
      resolve(event.content);
    });
  });
  
  // await expect(server).toReceiveMessage({
  //   "id": 1,
  //   "method": "ubiquity.subscribe",
  //   "params": {
  //     "channel": "ubiquity.block",
  //     "detail": {}
  //   }
  // });



  server.emit(JSON.stringify({
    "id": 1,
    "result": {
      "subID": 123
    }
  }));

  server.emit(JSON.stringify(
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
  ));
 
// const block = await response;
// expect(block).toEqual(ethBlock);

// ws.unsubscribe(sub);
// await expect(server).toReceiveMessage({
//   id: 2,
//   method: "ubiquity.unsubscribe",
//   params: {
//     channel: "ubiquity.block",
//     subID: 123,
//   },
// });

 
});

 