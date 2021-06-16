import { UbiquityClient, NETWORKS, PROTOCOL } from "../src/client";
import globalAxios from "axios";
import * as btcPlatformInfo from "./data/btc_platforminfo.json";

jest.mock("axios");

const client = new UbiquityClient("---> Auth Token Here");

afterEach(() => {
  (globalAxios.request as any).mockClear();
});

test("fetches platform info for btc successfully data from an API", async () => {
  (globalAxios.request as any).mockImplementation(() =>
    Promise.resolve({ status: 200, data: btcPlatformInfo })
  );

  const platform = await client.platformsApi.getPlatform(
    PROTOCOL.BITCOIN,
    NETWORKS.MAIN_NET
  );

  expect(globalAxios.request).toBeCalledTimes(1);
  expect(platform.data).toEqual(btcPlatformInfo);
});
