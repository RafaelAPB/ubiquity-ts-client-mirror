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

type Sub = {
  id: number;
  subID?: number;
  type: string;
  details: any;
  handler: Handler;
};

export class UbiWebsocketClient {
  private ws: Websocket;
  private id = 0;
  private subscriptions: Array<Sub> = [];

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

  private resubscribe() {
    this.handlers.clear();
    this.subscriptions.forEach((sub) =>
      this.subscribe(sub.type, sub.details, sub.handler)
    );
  }

  private getRequestId(): number {
    this.id = (this.id + 1) % 10000;
    return this.id;
  }

  public subscribe(type: string, details = {}, handler: Handler): Sub {
    const id = this.getRequestId();
    const sub: Sub = { id, type, details, handler };
    this.subscriptions.push(sub);

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
        sub.subID = ev.data.result.subID;
      }
    };

    this.ws?.addEventListener(WebsocketEvents.message, waitForResult);
    this.ws?.send(
      JSON.stringify({
        id: id,
        method: "ubiquity.subscribe",
        params: {
          channel: type,
          detail: details,
        },
      })
    );

    return sub;
  }

  public unsubscribe(subscription: Sub): void {
    const id = this.getRequestId();

    // add listener for unsubscribe result that will clean up everything
    const waitForResult = (instance: Websocket, ev: MessageEvent) => {
      if ("ubiquity.unsubscribe" === ev.data?.method && ev.data.id === id) {
        instance.removeEventListener(WebsocketEvents.message, waitForResult);
        if (ev.data.result === undefined || !ev.data.result) {
          // log an error
          return;
        }
        // remove sub from the list
        const index = this.subscriptions.indexOf(subscription, 0);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }

        // remove the handler from
        this.handlers.delete(subscription.subID);
      }
    };

    this.ws?.addEventListener(WebsocketEvents.message, waitForResult);
    this.ws?.send(
      JSON.stringify({
        id: id,
        method: "ubiquity.unsubscribe",
        params: {
          channel: "ubiquity.txs",
          subID: 123,
        },
      })
    );
  }
}
