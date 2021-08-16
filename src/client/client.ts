import {
  BlocksApi,
  PlatformsApi,
  SyncApi,
  AccountsApi,
  TransactionsApi,
  Configuration,
} from "../generated";
import { BASE_URL, WS_BASE_URL } from "./constants";
import { UbiWebsocket } from "./ubiWs"; 

export class UbiquityClient {
  accountsApi: AccountsApi;
  blocksApi: BlocksApi;
  platformsApi: PlatformsApi;
  transactionsApi: TransactionsApi;
  syncApi: SyncApi;
  configuration: Configuration;
  wsBasePath: string

  constructor(accessToken: string, basePath = BASE_URL, wsBasePath = WS_BASE_URL) {
    this.wsBasePath = wsBasePath;
    this.configuration = new Configuration({
      accessToken,
      basePath,
    });
    this.accountsApi = new AccountsApi(this.configuration);
    this.blocksApi = new BlocksApi(this.configuration);
    this.platformsApi = new PlatformsApi(this.configuration);
    this.transactionsApi = new TransactionsApi(this.configuration);
    this.syncApi = new SyncApi(this.configuration);
  }

    public websocket(platform: string, network: string):UbiWebsocket {
      return new UbiWebsocket(platform, network, this.configuration?.accessToken?.toString(), this.wsBasePath);
    }
}    



 