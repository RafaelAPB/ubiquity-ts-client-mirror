import WebSocket, {
  ExponentialBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvents,
} from "websocket-ts";
import { Block, BlockIdentifier, Tx } from "../generated";
import { WS_BASE_URL } from "./constants";


type TxItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: Tx;
};

type BlockItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: Block;
};

type BlockIdentifierItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: BlockIdentifier;
};

type Item = TxItem | BlockItem | BlockIdentifierItem;

type TxHandler = (instance: UbiWebsocketClient, event: TxItem) => void;
type BlockHandler = (instance: UbiWebsocketClient, event: BlockItem) => void;
type BlockIdentifierHandler = (
  instance: UbiWebsocketClient,
  event: BlockIdentifierItem
) => void;
type Handler = TxHandler | BlockHandler | BlockIdentifierHandler;


export class UbiWebsocketClient {
  private ws: Websocket;
  private subscriptions: Array<{
    type: string;
    details: any;
    handler: Handler;
  }> = [];

  private handlers = new Map<number, Handler>();

  constructor(
    platform: string,
    network: string,
    accessToken: string,
    basePath = WS_BASE_URL
  ) {
    const localVarPath = "/{platform}/{network}/websocket?auth={token}"
      .replace(`{${"platform"}}`, encodeURIComponent(String(platform)))
      .replace(`{${"network"}}`, encodeURIComponent(String(network)))
      .replace(`{${"token"}}`, encodeURIComponent(String(accessToken)));

    this.ws = new WebsocketBuilder(basePath + localVarPath)
      .onOpen(this.resubscribe)
      .onMessage((instance: Websocket, ev: MessageEvent) => {
        if ("ubiquity.subscription" === ev.data?.method) {
          ev.data.params.items.array.forEach((element: Item) => {
            if (this.handlers.has(element.subID)) {
              this.handlers.get(element.subID)(this, element);
            }
          });
        }
      })
      .withBackoff(new ExponentialBackoff(100, 8))
      .build();
  }

  private sendSubscribe(id: number, type: string, details = {}) {
    this.ws?.send(
      JSON.stringify({
        id: 1,
        method: "ubiquity.subscribe",
        params: {
          channel: type,
          detail: details,
        },
      })
    );
  }

  private resubscribe() {
    this.handlers.clear();
    this.subscriptions.forEach((sub, index) =>
      this.sendSubscribe(index, sub.type, sub.details)
    );
  }

  private subscribe(type: string, details = {}, handler: Handler): void {
    const l = this.subscriptions.push({ type, details, handler });
    const id = l - 1;

    // add listener for subscribe result that will add the message handler when the subID is recieved
    const waitForResult = (instance: Websocket, ev: MessageEvent) => {
      if ("ubiquity.subscribe" === ev.data?.method && ev.data.id === id) {
        instance.removeEventListener(WebsocketEvents.message, waitForResult);
        if (ev.data.result === undefined) {
          // log an error
          return;
        }
        // add handler to match subid
        this.handlers.set(ev.data.result.subID, handler);
      }
    };

    this.ws?.addEventListener(WebsocketEvents.message, waitForResult);
    this.sendSubscribe(id, type, details);
  }

 
}
