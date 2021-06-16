import { UbiquityClient, NETWORKS, PROTOCOL } from "../../src/client";
import { BlocksApi, Block, TxPage, Tx, Configuration } from "../../src/generated";
import { AxiosResponse } from "axios";

async function app(): Promise<void> {
  // To create a client supply an access token
  // Optionally a different base path can be provided
  const client = new UbiquityClient("---> Auth Token Here");

  // All of the API's return a promise of type AxiosResponse<T>
  client.blocksApi
    .getBlock(
      PROTOCOL.BITCOIN,
      NETWORKS.MAIN_NET,
      "685700"
    )
    .then((balance: AxiosResponse) => console.log(balance.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));

  // Initial request to paged API's should not include a continuation.
  // If no limit is supplied the default of 25 will be applied
  // A filter can also be applied to select the returned assets
  client.accountsApi
    .getTxsByAddress(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET,
      "0x49bC2A9EE1A08dbCa7dd66629700E68AA8DB09aC"
    )

    // To continue through the pages of transactions the continuation
    // from the previous page must be supplied to the next request
    .then((txsPage1: AxiosResponse<TxPage>) => {
      console.log(txsPage1);
      client.accountsApi
        .getTxsByAddress(
          PROTOCOL.ETHEREUM,
          NETWORKS.MAIN_NET,
          "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "desc",
          txsPage1.data.continuation
        )
        .then((txPage2: AxiosResponse<TxPage>) => console.log(txPage2))
        .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));
    })
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));

  // All of the API's return a promise of type AxiosResponse<T>
  client.platformsApi
    .getPlatform(
      PROTOCOL.POLKADOT,
      NETWORKS.MAIN_NET 
    )
    .then((balance: AxiosResponse) => console.log(balance.data))
    .catch((r: any) => console.log(r));
 

    
  client.syncApi
    .currentBlockID(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse<string>) => console.log(syncData.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));


  client.syncApi
    .currentBlockNumber(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse<number>) => console.log(syncData.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));
 

  client.transactionsApi
    .getTxs(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse<TxPage>) => console.log(syncData.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));


  client.transactionsApi
    .getTx(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET,
      "0x6821b32162ad40f979ad8e999ffbe358e5df0f54e1894d1b3fc3e01fce6a134b"
    )
    .then((syncData: AxiosResponse<Tx>) => console.log(syncData.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));


  // The generated clients can be used directly for lower level control or in the case of early stage features
  const configuration = new Configuration({accessToken: "Auth Token Here", basePath: "https://ubiquity.api.blockdaemon.com/v2"})
 
  const blockApi = new BlocksApi(configuration);
  blockApi
    .getBlock(
      PROTOCOL.BITCOIN,
      NETWORKS.MAIN_NET,
      "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
    )
    .then((r: AxiosResponse<Block>) => console.log(r.data))
    .catch((e: any) => console.log(`error code::${e.response.status} url::${e.config.url}`));
}

app();
