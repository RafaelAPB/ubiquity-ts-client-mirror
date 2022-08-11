import { BlockIdentifier, Tx } from "../generated";
import WebSocket from "isomorphic-ws";
export declare type TxItem = {
    subID: number;
    channel: string;
    revert: boolean;
    content: Tx;
};
export declare type BlockIdentifierItem = {
    subID: number;
    channel: string;
    revert: boolean;
    content: BlockIdentifier;
};
export declare type Item = TxItem | BlockIdentifierItem;
export declare type TxHandler = (instance: UbiWebsocket, event: TxItem) => void;
export declare type BlockIdentifierHandler = (instance: UbiWebsocket, event: BlockIdentifierItem) => void;
export declare type Handler = TxHandler | BlockIdentifierHandler;
export declare type Subscription = {
    id: number;
    subID: number;
    type: string;
    detail?: any;
    handler: Handler;
};
export declare type SubscriptionRequest = {
    id: number;
    method: string;
    params: {
        [key: string]: any;
    } | Array<any>;
};
export declare class UbiWebsocket {
    reconnectTime: number;
    timeout: number;
    onError: (ev: WebSocket.ErrorEvent) => void;
    rawWs: WebSocket;
    private id;
    private subscriptions;
    private handlers;
    private url;
    private closedByUser;
    constructor(platform: string, network: string, accessToken?: string, basePath?: string);
    connect(): Promise<void>;
    close(code?: number, reason?: string): void;
    terminate(): void;
    private getRequestId;
    subscribe(subscription: Subscription): Promise<Subscription>;
    private processSubscribe;
    unsubscribe(subscription: Subscription): Promise<void>;
}
