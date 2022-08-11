import { BlocksApi, PlatformsApi, SyncApi, AccountsApi, TransactionsApi, Configuration } from "../generated";
import { UbiWebsocket } from "./ubiWs";
export declare class UbiquityClient {
    accountsApi: AccountsApi;
    blocksApi: BlocksApi;
    platformsApi: PlatformsApi;
    transactionsApi: TransactionsApi;
    syncApi: SyncApi;
    configuration: Configuration;
    wsBasePath: string;
    constructor(accessToken: string, basePath?: string, wsBasePath?: string);
    websocket(platform: string, network: string): UbiWebsocket;
}
