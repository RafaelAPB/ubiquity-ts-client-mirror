"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UbiWebsocket = void 0;
const constants_1 = require("./constants");
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
class UbiWebsocket {
    constructor(platform, network, accessToken, basePath = constants_1.WS_BASE_URL) {
        this.reconnectTime = 10000;
        this.timeout = 30000;
        this.onError = (ev) => console.error("Websocket encountered an error code::%s message::%s, the websocket will be retried in %sms ", ev.error, ev.message, this.reconnectTime);
        this.rawWs = new isomorphic_ws_1.default("uninitialized");
        this.id = 0;
        this.subscriptions = [];
        this.handlers = new Map();
        this.closedByUser = false;
        const encodedPlatform = encodeURIComponent(String(platform));
        const encodedNetwork = encodeURIComponent(String(network));
        const encodedToken = encodeURIComponent(String(accessToken));
        this.url = `${basePath}/${encodedPlatform}/${encodedNetwork}/websocket?apiKey=${encodedToken}`;
        this.rawWs = new isomorphic_ws_1.default(this.url);
    }
    connect() {
        const timeout = new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(`Timed out after ${this.timeout} ms.`);
            }, this.timeout);
        });
        return Promise.race([
            timeout,
            new Promise((resolve, reject) => {
                this.rawWs.addEventListener("open", () => {
                    this.handlers.clear();
                    this.subscriptions.forEach((sub) => this.processSubscribe(sub));
                    resolve();
                });
                this.rawWs.addEventListener("message", (ev) => {
                    const e = JSON.parse(ev.data.toString());
                    if ("ubiquity.subscription" === e.method) {
                        e.params.items.forEach((element) => {
                            const thereIsHandler = this.handlers.has(element.subID);
                            if (thereIsHandler) {
                                // eslint-disable-next-line @typescript-eslint/ban-types
                                const handler = this.handlers.get(element.subID);
                                handler(this, element);
                            }
                        });
                    }
                });
                this.rawWs.addEventListener("error", (ev) => {
                    var _a;
                    (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, ev);
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
    close(code = 1000, reason) {
        this.closedByUser = true;
        this.rawWs.close(code, reason);
        this.rawWs.removeAllListeners();
    }
    terminate() {
        this.closedByUser = true;
        this.rawWs.terminate();
        this.rawWs.removeAllListeners();
    }
    getRequestId() {
        this.id = (this.id + 1) % 10000;
        return this.id;
    }
    subscribe(subscription) {
        return new Promise((resolve, reject) => {
            if (typeof (this.rawWs) === "undefined" || (isomorphic_ws_1.default.OPEN !== this.rawWs.readyState)) {
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
    processSubscribe(subscription) {
        const timeout = new Promise((_resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(`Timed out after ${this.timeout} ms.`);
            }, this.timeout);
        });
        return Promise.race([
            timeout,
            new Promise((resolve, reject) => {
                var _a, _b;
                // add listener for subscribe result that will add the message handler when the subID is recieved
                const waitForResult = (ev) => {
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
                    },
                };
                if (subscription.detail) {
                    if (!(subscribe.params instanceof Array)) {
                        subscribe.params.detail = subscription.detail;
                    }
                }
                (_a = this.rawWs) === null || _a === void 0 ? void 0 : _a.addEventListener("message", waitForResult);
                (_b = this.rawWs) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify(subscribe));
            }),
        ]);
    }
    unsubscribe(subscription) {
        const timeout = new Promise((_resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(`unsubscribe timed out after waiting ${this.timeout} ms.`);
            }, this.timeout);
        });
        return Promise.race([
            timeout,
            new Promise((resolve, reject) => {
                var _a, _b;
                const id = this.getRequestId();
                // remove sub from the list
                const index = this.subscriptions.indexOf(subscription, 0);
                if (index > -1) {
                    this.subscriptions.splice(index, 1);
                }
                // remove the handler from
                this.handlers.delete(subscription.subID);
                // If the websocket is already closed then dont bother sending the request since it will already be gone
                if (isomorphic_ws_1.default.OPEN !== this.rawWs.readyState) {
                    resolve();
                }
                const waitForResult = (ev) => {
                    const e = JSON.parse(ev.data.toString());
                    if (e.id === id) {
                        this.rawWs.removeEventListener("message", waitForResult);
                        if (e.result === undefined || !e.result) {
                            reject(new Error("Failed to delete subscription"));
                        }
                        resolve();
                    }
                };
                (_a = this.rawWs) === null || _a === void 0 ? void 0 : _a.addEventListener("message", waitForResult);
                (_b = this.rawWs) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({
                    id: id,
                    method: "ubiquity.unsubscribe",
                    params: {
                        channel: subscription.type,
                        subID: subscription.subID,
                    },
                }));
            }),
        ]);
    }
}
exports.UbiWebsocket = UbiWebsocket;
