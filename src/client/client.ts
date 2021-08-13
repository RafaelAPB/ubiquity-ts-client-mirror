import {
  BlocksApi,
  PlatformsApi,
  SyncApi,
  AccountsApi,
  TransactionsApi,
  Configuration,
} from "../generated";
import { BASE_URL, WS_BASE_URL } from "./constants";
import { UbiWebsocket } from "./ubi-ws"; 

export class UbiquityClient {
  accountsApi: AccountsApi;
  blocksApi: BlocksApi;
  platformsApi: PlatformsApi;
  transactionsApi: TransactionsApi;
  syncApi: SyncApi;

  ws: {
    connect: (platform: string, network: string)=> UbiWebsocket;
  };


  constructor(accessToken: string, basePath = BASE_URL, wsBasePath = WS_BASE_URL) {
    const configuration = new Configuration({
      accessToken,
      basePath,
    });
    this.accountsApi = new AccountsApi(configuration);
    this.blocksApi = new BlocksApi(configuration);
    this.platformsApi = new PlatformsApi(configuration);
    this.transactionsApi = new TransactionsApi(configuration);
    this.syncApi = new SyncApi(configuration);

    this.ws = {
      connect: (platform: string, network: string) => new UbiWebsocket(platform, network, accessToken, wsBasePath)
    };

  }

}    



 