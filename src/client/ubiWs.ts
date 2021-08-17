import { Block, BlockIdentifier, Tx } from "../generated";
import { WS_BASE_URL } from "./constants";
import WebSocket from "isomorphic-ws";

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

export type TxHandler = (instance: UbiWebsocket, event: TxItem) => void;
export type BlockHandler = (instance: UbiWebsocket, event: BlockItem) => void;
export type BlockIdentifierHandler = (
  instance: UbiWebsocket,
  event: BlockIdentifierItem
) => void;
export type Handler = TxHandler | BlockHandler | BlockIdentifierHandler;

export type Subscription = {
  id?: number;
  subID?: number;
  type: string;
  detail?: any;
  handler: Handler;
};

export class UbiWebsocket {
  public reconnectTime = 5000;
  public timeout = 10000;
  public onError = (ev: WebSocket.ErrorEvent): void =>
    console.error(
      "Websocket encountered an error code::%s message::%s, the websocket will be retried in %sms ",
      ev.error,
      ev.message,
      this.reconnectTime
    );
    public rawWs: WebSocket;
 
  private id = 0;
  private subscriptions: Array<Subscription> = [];
  private handlers = new Map<number, Handler>();
  private url: string;
  private closedByUser = false;

  public constructor(
    platform: string,
    network: string,
    accessToken: string,
    basePath = WS_BASE_URL
  ) {
    const encodedPlatform = encodeURIComponent(String(platform));
    const encodedNetwork = encodeURIComponent(String(network));
    const encodedToken = encodeURIComponent(String(accessToken));
    this.url = `${basePath}/${encodedPlatform}/${encodedNetwork}/websocket?apiKey=${encodedToken}`;
  }

 
  public connect(): Promise<void> {
    const timeout = new Promise<void>((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(`Timed out after ${this.timeout} ms.`);
      }, this.timeout);
    });

    return Promise.race([
      timeout,
      new Promise<void>((resolve, reject) => {
        this.rawWs = new WebSocket(this.url);

        this.rawWs.addEventListener("open", () => {
          this.handlers.clear();
          this.subscriptions.forEach((sub) => this.processSubscribe(sub));
          resolve();
        });

        this.rawWs.addEventListener("message", (ev: WebSocket.MessageEvent) => {
          const e = JSON.parse(ev.data.toString());
          if ("ubiquity.subscription" === e.method) {
            e.params.items.forEach((element: Item) => {
              if (this.handlers.has(element.subID)) {
                this.handlers.get(element.subID)(this, element);
              }
            });
          }
        });

        this.rawWs.addEventListener("error", (ev: WebSocket.ErrorEvent) => {
          this.onError?.(ev);
          reject(ev);
        });

        this.rawWs.addEventListener("close", () => {
          if (this.closedByUser) {
            setTimeout(() => this.connect(), this.reconnectTime);
          }
        });
      }),
    ]);
  }

  public close(code?: number, reason?: string): void {
    this.closedByUser = true;
    this.rawWs?.close(code, reason);
  }

  public terminate( ): void {
    this.closedByUser = true;
    this.rawWs?.terminate();
  }
 
  private getRequestId(): number {
    this.id = (this.id + 1) % 10000;
    return this.id;
  }

  public subscribe(subscription: Subscription): Promise<Subscription> {
    return new Promise<Subscription>((resolve, reject) => {
      if (WebSocket.OPEN !== this.rawWs.readyState) {
        reject(new Error("Websocket is not open"));
      }
 
      subscription.id = this.getRequestId();
      this.processSubscribe(subscription)
        .then((sub) => {
          this.subscriptions.push(sub);
          resolve(sub);
        })
        .catch(reject);
    });
  }

  private processSubscribe(subscription: Subscription): Promise<Subscription> {
    const timeout = new Promise<Subscription>((_resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(`Timed out after ${this.timeout} ms.`);
      }, this.timeout);
    });

    return Promise.race([
      timeout,
      new Promise<Subscription>((resolve, reject) => {
        // add listener for subscribe result that will add the message handler when the subID is recieved
        const waitForResult = (ev: WebSocket.MessageEvent) => {
          const e = JSON.parse(ev.data.toString());
          if (e.id === subscription.id) {
            this.rawWs.removeEventListener("message", waitForResult);
            if (e.result === undefined || e.result.subID === undefined) {
              reject(new Error("Failed to subscribe"));
            }
            // add handler to match subid
            this.handlers.set(e.result.subID, subscription.handler);
            subscription.subID = e.result.subID;
            resolve(subscription);
          }
        };

        const subscribe = {
          id: subscription.id,
          method: "ubiquity.subscribe",
          params: {
            channel: subscription.type,
            detail: subscription.detail,
          },
        };
 
        this.rawWs?.addEventListener("message", waitForResult);
        this.rawWs?.send(JSON.stringify(subscribe));
      }),
    ]);
  }

  public unsubscribe(subscription: Subscription): Promise<void> {
    const timeout = new Promise<void>((_resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(`unsubscribe timed out after waiting ${this.timeout} ms.`);
      }, this.timeout);
    });

    return Promise.race([
      timeout,
      new Promise<void>((resolve, reject) => {
        const id = this.getRequestId();

        // remove sub from the list
        const index = this.subscriptions.indexOf(subscription, 0);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }

        // remove the handler from
        this.handlers.delete(subscription.subID);

        // If the websocket is already closed then dont bother sending the request since it will already be gone
        if (WebSocket.OPEN !== this.rawWs.readyState) {
          resolve();
        }

        const waitForResult = (ev: WebSocket.MessageEvent) => {
          const e = JSON.parse(ev.data.toString());
          if (e.id === id) {
            this.rawWs.removeEventListener("message", waitForResult);
            if (e.result === undefined || !e.result) {
              reject(new Error("Failed to delete subscription"));
            }
            resolve();
          }
        };

        this.rawWs?.addEventListener("message", waitForResult);
        this.rawWs?.send(
          JSON.stringify({
            id: id,
            method: "ubiquity.unsubscribe",
            params: {
              channel: subscription.type,
              subID: subscription.subID,
            },
          })
        );
      }),
    ]);
  }
}
