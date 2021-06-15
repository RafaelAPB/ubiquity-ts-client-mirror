
import { UbiquityClient, NETWORKS, PROTOCOL } from "../src/client";
import globalAxios from "axios";

jest.mock("axios");

const client = new UbiquityClient("---> Auth Token Here");

afterEach(() => {
  (globalAxios.request as any).mockClear();
});

test("fetches bitcoin block id successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: "0000000000000000000cb123a7e539a7d4ea04c6053d243382cde5c46d050898"})
  );

  const blockId = await client.syncApi.currentBlockID(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET);
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(blockId.data).toEqual("0000000000000000000cb123a7e539a7d4ea04c6053d243382cde5c46d050898");
});

test("fetches bitcoin block number successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: 685955})
  );

  const blockNumber = await client.syncApi.currentBlockNumber(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET);
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(blockNumber.data).toEqual(685955);
});
