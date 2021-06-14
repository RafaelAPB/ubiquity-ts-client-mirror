
import { PlatformsApi, Configuration } from "../src/client-axios";
import globalAxios from "axios";
import * as btcPlatformInfo from "./data/btc_platforminfo.json";

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

test("fetches platform info for btc successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({status:200, data: btcPlatformInfo})
  );
 
  const platformApi = new PlatformsApi(configuration, basePath);
  const platform = await platformApi.getPlatform(
      "bitcoin",
      "mainnet"
    );
    
  expect(globalAxios.request).toBeCalledTimes(1);
  expect(platform.data).toEqual(btcPlatformInfo);
});

