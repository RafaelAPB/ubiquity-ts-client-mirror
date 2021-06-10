
import { BlocksApi, Configuration } from "../src/client-axios";
import axios from "axios";
import * as responseBlock from "./data/responses/btc_block.json";
import * as expectedBlock from "./data/expected/btc_block.json";
jest.mock("axios");

const basePath = "https://ubiquity.api.blockdaemon.com/v2";

it("fetches successfully data from an API", async () => {
  const configuration = new Configuration({
    apiKey: "",
    username: "",
    password: "",
    accessToken: "",
    basePath: "",
    baseOptions: "",
  });

  const blockApi = new BlocksApi(configuration, basePath);

  (axios.request as any).mockImplementationOnce(() =>
    Promise.resolve({status:200, data: responseBlock})
  );
  await expect(
    blockApi.getBlock(
      "bitcoin",
      "mainnet",
      "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
    )
  );



  expect(axios.request).toHaveBeenCalledWith(
    "https://ubiquity.api.blockdaemon.com/v2/bitcoin/mainnet/block/00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
  );

  // expect(thenFn).toMatchObject(expectedBlock);
  //"https://ubiquity.api.blockdaemon.com/v2/bitcoin/mainnet/block/00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
});
