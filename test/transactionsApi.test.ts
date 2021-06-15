
import { UbiquityClient, NETWORKS, PROTOCOL } from "../src/client";
import globalAxios from "axios";
import * as diemTxPage1 from "./data/diem_tx_page_1.json";
import * as diemTxPage2 from "./data/diem_tx_page_2.json";
import * as ethTx from "./data/eth_tx.json";

jest.mock("axios");
const client = new UbiquityClient("---> Auth Token Here");

afterEach(() => {
  (globalAxios.request as any).mockClear();
});

test("fetches btc tx successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: ethTx})
  );
 
  const tx = await client.transactionsApi.getTx(
      PROTOCOL.ETHEREUM,
      NETWORKS.MAIN_NET,
      "0x6821b32162ad40f979ad8e999ffbe358e5df0f54e1894d1b3fc3e01fce6a134b"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(tx.data).toEqual(ethTx);
});

test("fetches diem tx page successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: diemTxPage1})
  );
 
  const txPage = await client.transactionsApi.getTxs(
      "diem",
      "mainnet",
      "desc",
      ""
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(txPage.data).toEqual(diemTxPage1);
});

test("fetches diem tx page with continuation successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: diemTxPage2})
  );
 
  const txPage = await client.transactionsApi.getTxs(
      "diem",
      "mainnet",
      "desc",
      "24"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(txPage.data).toEqual(diemTxPage2);
});
