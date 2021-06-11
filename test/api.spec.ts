
import { BlocksApi, Configuration } from "../src/client-axios";
import globalAxios from "axios";
import * as responseBlock from "./data/btc_block.json";
jest.mock("axios");

const basePath = "https://ubiquity.api.blockdaemon.com/v2";
const configuration = new Configuration({
  apiKey: "",
  username: "",
  password: "",
  accessToken: "",
  basePath: "",
  baseOptions: "",
});

it("fetches btc block successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: responseBlock})
  );
 
  const blockApi = new BlocksApi(configuration, basePath);
  const block = await blockApi.getBlock(
      "bitcoin",
      "mainnet",
      "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(block.data).toEqual(responseBlock);
});

it("fetches eth block successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: responseBlock})
  );
 
  const blockApi = new BlocksApi(configuration, basePath);

  const block = await blockApi.getBlock(
      "ethereum",
      "mainnet",
      "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(block.data).toEqual(responseBlock);
});