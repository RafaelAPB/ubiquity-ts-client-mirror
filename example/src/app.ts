import { UbiquityClient, NETWORKS, PROTOCOL } from "../../src/client";
import { BlocksApi, Block, TxPage, Configuration } from "../../src/generated";
import { AxiosResponse } from "axios";

async function app(): Promise<void> {
  // To create a client supply an access token
  // Optionally a different base path can be provided
  const client = new UbiquityClient(
    "YhLMUNJef5fgjW5cke9Y",
    "https://stg.ubiquity.api.blockdaemon.com/v2"
  ); //"---> Auth Token Here");

  // All of the API's return a promise of type AxiosResponse<T>
  client.blocksApi
    .getBlock(
      PROTOCOL.ALGORAND,
      NETWORKS.MAIN_NET,
      "HG2JL36OPPITBA7RNIPW4GUQS74AF3SEBO6DAJSLJC33C34I2DQ42F5MU4"
    )
    .then((balance: AxiosResponse) => console.log(balance.data));

  // Initial request to paged API's should not include a continuation.
  // If no limit is supplied the default of 25 will be applied
  // A filter can also be applied to select the returned assets
  client.accountsApi
    .getTxsByAddress(
      PROTOCOL.DIEM,
      NETWORKS.MAIN_NET,
      "0x49bC2A9EE1A08dbCa7dd66629700E68AA8DB09aC"
    )
    // To continue through the pages of transactions the continuation
    // from the previous page must be supplied to the next request
    .then((txsPage1: AxiosResponse<TxPage>) => {
      console.log(txsPage1);
      client.accountsApi
        .getTxsByAddress(
          PROTOCOL.DIEM,
          NETWORKS.MAIN_NET,
          "0x49bC2A9EE1A08dbCa7dd66629700E68AA8DB09aC",
          "desc",
          txsPage1.data.continuation
        )
        .then((txPage2: AxiosResponse<TxPage>) => console.log(txPage2));
    });

  // All of the API's return a promise of type AxiosResponse<T>
  client.platformsApi
    .getPlatform(
      PROTOCOL.POLKADOT,
      NETWORKS.MAIN_NET 
    )
    .then((balance: AxiosResponse) => console.log(balance.data));
 
  // All of the API's return a promise of type AxiosResponse<T>
  client.syncApi
    .currentBlockID(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse) => console.log(syncData.data));

  client.syncApi
    .currentBlockNumber(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET
    )
    .then((syncData: AxiosResponse) => console.log(syncData.data));

  // The generated clients can be used directly for lower level control or in the case of early stage features
  // const configuration = new Configuration({accessToken: "accessToken", basePath: "https://ubiquity.api.blockdaemon.com/v2"})
  const configuration = new Configuration({
    accessToken: "YhLMUNJef5fgjW5cke9Y",
    basePath: "https://stg.ubiquity.api.blockdaemon.com/v2",
  });
  const blockApi = new BlocksApi(configuration);

  blockApi
    .getBlock(
      PROTOCOL.BITCOIN,
      NETWORKS.MAIN_NET,
      "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
    )
    .then((r: AxiosResponse<Block>) => console.log(r.data));
}

app();
