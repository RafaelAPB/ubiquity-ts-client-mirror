import { UbiquityClient, NETWORKS, PROTOCOL } from "@ubiquity/ubiquity-ts-client";
import { TxPage, Tx } from "@ubiquity/ubiquity-ts-client";
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
    .then((block: AxiosResponse) => console.log("Block:", block.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));

  // Initial request to paged API's should not include a continuation.
  // If no limit is supplied the default of 25 will be applied
  // A filter can also be applied to select the returned assets
 

  // All of the API's return a promise of type AxiosResponse<T>
  client.platformsApi
    .getPlatformEndpoints(
      PROTOCOL.POLKADOT,
      NETWORKS.MAIN_NET 
    )
    .then((overview: AxiosResponse) => console.log("Platform endpoints: ", overview.data))
    .catch(r => console.log(r));
 

    
  client.syncApi
    .currentBlockID(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse<string>) => console.log("Current block ID: ", syncData.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));


  client.syncApi
    .currentBlockNumber(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse<number>) => console.log("Current block number: ", syncData.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));
 

  client.transactionsApi
    .getTxs(
      PROTOCOL.BITCOIN_CASH,
      NETWORKS.MAIN_NET
    )
    .then((txPage: AxiosResponse<TxPage>) => console.log("txs: ", txPage.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));


  client.transactionsApi
    .getTx(
      PROTOCOL.TEZOS,
      NETWORKS.MAIN_NET,
      "onhbU4nd1A9BrvAsWx5QHfQMhjcmJtC5dzpmwxrycdt7FbYcQ7L"
    )
    .then((tx: AxiosResponse<Tx>) => console.log("tx: ", tx.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));

}

app();
