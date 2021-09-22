import { createAndSign, ethTransaction, UbiquityClient, NETWORKS, PROTOCOL } from "@ubiquity/ubiquity-ts-client";

async function main() {
  if (process.argv.length < 7) {
    console.log("USAGE: ./ethTransaction accessToken nonce outputAddr outputAmount privateKey");
    return;
  }

  const [
    _, __,
    ubiAccessToken,
    nonce,
    outputAddr, outputAmount,
    privateKey
  ] = process.argv;

  // API client needed to get gas limit value from the network
  const apiClient = new UbiquityClient(ubiAccessToken);

  const gasPriceRes = await apiClient.transactionsApi.estimateFee(PROTOCOL.ETHEREUM, NETWORKS.ROPSTEN);
  const gasPrice = Number(gasPriceRes.data);
  const input = [
    {
      hash: "", // for ETH input hash is not needed
      index: Number(nonce)
    }
  ];

  const fee = 21000;
  const outputs = [
    {
      address: outputAddr,
      amount: Number(outputAmount)
    }
  ];

  const rawSignedTx = await createAndSign(input, outputs, privateKey, ethTransaction, {
    fee: fee,
    gasPrice,
    network: NETWORKS.ROPSTEN
  });

  console.log("Raw signed transaction:", rawSignedTx.tx);
}

main().catch(console.error)
