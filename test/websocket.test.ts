import {
  UbiquityClient,
  NETWORKS,
  PROTOCOL,
  WS_CHANNELS,
  UbiWebsocket,
  BlockItem,
} from "../src/client";
import WebSocket from "isomorphic-ws";
import * as ethBlock from "./data/eth_block.json";

let ubiWs: UbiWebsocket;
let server: WebSocket.Server;

test("Websocket subscribe/unsubscribe/subscription happy path", async () => {
  const events: any[] = [];
  server = await new Promise<WebSocket.Server>((resolve, rejects) => {
    const wss = new WebSocket.Server(
      { host: "localhost", port: 0, path: "/ethereum/mainnet/websocket" },
      () => resolve(wss)
    ) as WebSocket.Server;

    wss.on("connection", (ws: WebSocket) => {
      console.log("connected");
      ws.on("message", (message: any) => {
        const e = JSON.parse(message.toString());
        events.push(e);
        console.log("server got message %s", message);
        if (e.method === "ubiquity.subscribe") {
          ws.send(
            JSON.stringify({
              id: 1,
              result: {
                subID: 123,
              },
            })
          );
          ws.send(
            JSON.stringify({
              method: "ubiquity.subscription",
              params: {
                items: [
                  {
                    subID: 123,
                    channel: "ubiquity.block",
                    revert: false,
                    content: ethBlock,
                  },
                ],
              },
            })
          );
        }
        if (e.method === "ubiquity.unsubscribe") {
          ws.send(
            JSON.stringify({
              id: 2,
              result: {
                removed: true,
              },
            })
          );
        }
      });
    });
  });

  const address = server.address() as WebSocket.AddressInfo;
  const client = new UbiquityClient(
    "authtoken",
    undefined,
    `ws://127.0.0.1:${address.port}`
  );
  ubiWs = client.websocket(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  ubiWs.onError = undefined;
  await ubiWs.connect();

  let subscriptionPromise;
  const blockFromSubscription = new Promise((resolve) => {
    subscriptionPromise = ubiWs.subscribe({
      type: WS_CHANNELS.BLOCK,
      handler: (instance: UbiWebsocket, event: BlockItem) => {
        resolve(event.content);
      }}
    );
  });

  const subscription = await subscriptionPromise;

  const block = await blockFromSubscription;
  expect(block).toEqual(ethBlock);

  await ubiWs.unsubscribe(subscription).then(() => {
    expect(events[events.length - 1]).toEqual({
      method: "ubiquity.unsubscribe",
      id: 2,
      params: {
        channel: "ubiquity.block",
        subID: 123,
      },
    });
  });
});

test("Test rejection of promise if open connection fails", async () => {
  server = await new Promise<WebSocket.Server>((resolve, rejects) => {
    const wss = new WebSocket.Server(
      { host: "localhost", port: 0, path: "/ethereum/mainnet/websocket" },
      () => resolve(wss)
    ) as WebSocket.Server;

    wss.on("connection", (ws: WebSocket) => {
      ws.close(1006, "problem");
    });
  });

  const address = server.address() as WebSocket.AddressInfo;
  const client = new UbiquityClient(
    "authtoken",
    undefined,
    `ws://127.0.0.1:${address.port}`
  );

  ubiWs = client.websocket(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);
  ubiWs.onError = undefined;
  const connectPromise = ubiWs.connect();
  expect(connectPromise).rejects.toEqual(expect.objectContaining({ message: "WebSocket was closed before the connection was established"}));
  
});

afterEach(() => {
  ubiWs?.terminate();
  server?.close();
});