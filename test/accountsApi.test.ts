
import { AccountsApi, Configuration } from "../src/client-axios";
import globalAxios from "axios";
import * as algoAccountBalance from "./data/algo_account_balance.json";
import * as diemTxPage1 from "./data/diem_tx_page_1.json";
import * as diemTxPage2 from "./data/diem_tx_page_2.json";

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

test("fetches algo account balance successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: algoAccountBalance})
  );
 
  const accountsApi = new AccountsApi(configuration, basePath);
  const balance = await accountsApi.getBalancesByAddress(
      "algorand",
      "mainnet",
      "HG2JL36OPPITBA7RNIPW4GUQS74AF3SEBO6DAJSLJC33C34I2DQ42F5MU4"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(balance.data).toEqual(algoAccountBalance);
});

test("fetches diem account txs successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: diemTxPage1})
  );
 
  const accountsApi = new AccountsApi(configuration, basePath);
  const txs = await accountsApi.getTxsByAddress(
      "diem",
      "mainnet",
      "0x49bC2A9EE1A08dbCa7dd66629700E68AA8DB09aC"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(txs.data).toEqual(diemTxPage1);
});

test("fetches diem account txs with continuations successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: diemTxPage2})
  );
 
  const accountsApi = new AccountsApi(configuration, basePath);
  const txs = await accountsApi.getTxsByAddress(
      "diem",
      "mainnet",
      "0x49bC2A9EE1A08dbCa7dd66629700E68AA8DB09aC",
      "desc",
      "24"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(txs.data).toEqual(diemTxPage2);
});
