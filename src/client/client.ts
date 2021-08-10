import {
  BlocksApi,
  PlatformsApi,
  SyncApi,
  AccountsApi,
  TransactionsApi,
  Configuration,
} from "../generated";
import { BASE_URL } from "./constants";
import {Websocket, WebsocketBuilder, ExponentialBackoff} from "websocket-ts";

export class UbiquityClient {
  accountsApi: AccountsApi;
  blocksApi: BlocksApi;
  platformsApi: PlatformsApi;
  transactionsApi: TransactionsApi;
  syncApi: SyncApi;
  

  constructor(accessToken: string, basePath = BASE_URL) {
    const configuration = new Configuration({
      accessToken,
      basePath,
    });
    this.accountsApi = new AccountsApi(configuration);
    this.blocksApi = new BlocksApi(configuration);
    this.platformsApi = new PlatformsApi(configuration);
    this.transactionsApi = new TransactionsApi(configuration);
    this.syncApi = new SyncApi(configuration);
  }

  public txWs = (platform: string, network: string, handler: (instance: Websocket, ev: MessageEvent) => any)=>{
      
    const localVarPath = `/{platform}/{network}/websocket`
    .replace(`{${"platform"}}`, encodeURIComponent(String(platform)))
    .replace(`{${"network"}}`, encodeURIComponent(String(network)));  
    
    const ws  = new WebsocketBuilder(BASE_URL + localVarPath)
      .withBackoff(new ExponentialBackoff(100, 7))
      .build();


      return ws;

  };  

  public blockWs = ()=>{

  };
  public blockIdentityWs = ()=>{

  };

}


 




}    






const ws = new WebsocketBuilder('ws://localhost:42421')
.onOpen((i, ev) => { console.log("opened") })
.onError((i, ev) => { console.log("error") })
.onMessage((i, ev) => { console.log("message") })
.onRetry((i, ev) => { console.log("retry") })
.build();