import   {
  ExponentialBackoff,
  Websocket,
  WebsocketBuilder,
  WebsocketEvents,
} from "websocket-ts";
import { Block, BlockIdentifier, Tx } from "../generated";
import { WS_BASE_URL } from "./constants";

export type TxItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: Tx;
};

export type BlockItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: Block;
};

export type BlockIdentifierItem = {
  subID: number;
  channel: string;
  revert: boolean;
  content: BlockIdentifier;
};

export type Item = TxItem | BlockItem | BlockIdentifierItem;

export type TxHandler = (instance: UbiWebsocketClient, event: TxItem) => void;
export type BlockHandler = (instance: UbiWebsocketClient, event: BlockItem) => void;
export type BlockIdentifierHandler = (
  instance: UbiWebsocketClient,
  event: BlockIdentifierItem
) => void;
export type Handler = TxHandler | BlockHandler | BlockIdentifierHandler;

export type Sub = {
  id: number;
  subID?: number;
  type: string;
  detail: any;
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
      .onOpen(() =>{
        this.handlers.clear();
        this.subscriptions.forEach((sub) =>
          this.subscribe(sub.type, sub.detail, sub.handler)
        );
      })
      .onMessage((instance: Websocket, ev: MessageEvent) => {
        const e = JSON.parse(ev.data);
        if ("ubiquity.subscription" === e.method) {
          e.params.items.forEach((element: Item) => {
            if (this.handlers.has(element.subID)) {
              this.handlers.get(element.subID)(this, element);
            }
          });
        }
      })
      .withBackoff(new ExponentialBackoff(100, 8))
      .build();
  }

  private getRequestId(): number {
    this.id = (this.id + 1) % 10000;
    return this.id;
  }

  public subscribe(type: string,  handler: Handler, detail = {}): Sub {
    const id = this.getRequestId();
    const sub: Sub = { id, type, detail, handler };
    this.subscriptions.push(sub);

    // add listener for subscribe result that will add the message handler when the subID is recieved
    const waitForResult = (instance: Websocket, ev: MessageEvent) => {
      const e = JSON.parse(ev.data);
      if ( e.id === id) {
        instance.removeEventListener(WebsocketEvents.message, waitForResult);
        if (e.result === undefined) {
          // log an error
          return;
        }
        // add handler to match subid
        this.handlers.set(e.result.subID, handler);
        sub.subID = e.result.subID;
      }
    };

    this.ws?.addEventListener(WebsocketEvents.message, waitForResult);
    this.ws?.send(
      JSON.stringify({
        id: id,
        method: "ubiquity.subscribe",
        params: {
          channel: type,
          detail,
        },
      })
    );

    return sub;
  }

  public unsubscribe(subscription: Sub): void {
    const id = this.getRequestId();

    // add listener for unsubscribe result that will clean up everything
    const waitForResult = (instance: Websocket, ev: MessageEvent) => {
      const e = JSON.parse(ev.data);
      if ( e.id === id) {
        instance.removeEventListener(WebsocketEvents.message, waitForResult);
        if (e.result === undefined || !e.result) {
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
          channel: subscription.type,
          subID: subscription.subID,
        },
      })
    );
  }
}
