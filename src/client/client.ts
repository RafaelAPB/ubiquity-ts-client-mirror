import {
  BlocksApi,
  PlatformsApi,
  SyncApi,
  AccountsApi,
  TransactionsApi,
  Configuration,
} from "../generated";
import { BASE_URL } from "./constants";

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
}
