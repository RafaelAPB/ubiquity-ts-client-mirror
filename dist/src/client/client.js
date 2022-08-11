"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UbiquityClient = void 0;
const generated_1 = require("../generated");
const constants_1 = require("./constants");
const ubiWs_1 = require("./ubiWs");
class UbiquityClient {
    constructor(accessToken, basePath = constants_1.BASE_URL, wsBasePath = constants_1.WS_BASE_URL) {
        this.wsBasePath = wsBasePath;
        this.configuration = new generated_1.Configuration({
            accessToken,
            basePath,
        });
        this.accountsApi = new generated_1.AccountsApi(this.configuration);
        this.blocksApi = new generated_1.BlocksApi(this.configuration);
        this.platformsApi = new generated_1.PlatformsApi(this.configuration);
        this.transactionsApi = new generated_1.TransactionsApi(this.configuration);
        this.syncApi = new generated_1.SyncApi(this.configuration);
    }
    websocket(platform, network) {
        var _a, _b;
        return new ubiWs_1.UbiWebsocket(platform, network, (_b = (_a = this.configuration) === null || _a === void 0 ? void 0 : _a.accessToken) === null || _b === void 0 ? void 0 : _b.toString(), this.wsBasePath);
    }
}
exports.UbiquityClient = UbiquityClient;
