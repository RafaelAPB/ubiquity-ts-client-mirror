
import { SyncApi, Configuration } from "../src/client-axios";
import globalAxios from "axios";

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

afterEach(() => {
  (globalAxios.request as any).mockClear();
});

test("fetches bitcoin block id successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: "0000000000000000000cb123a7e539a7d4ea04c6053d243382cde5c46d050898"})
  );
 
  const syncApi = new SyncApi(configuration, basePath);
  const blockId = await syncApi.currentBlockID("bitcoin", "mainnet");
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(blockId.data).toEqual("0000000000000000000cb123a7e539a7d4ea04c6053d243382cde5c46d050898");
});

test("fetches bitcoin block number successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: 685955})
  );
 
  const syncApi = new SyncApi(configuration, basePath);
  const blockNumber = await syncApi.currentBlockNumber("bitcoin", "mainnet");
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(blockNumber.data).toEqual(685955);
});
