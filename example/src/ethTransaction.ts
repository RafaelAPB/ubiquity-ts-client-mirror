import { createAndSign, ethTransaction, NETWORKS } from "@ubiquity/ubiquity-ts-client";

async function main() {
  if (process.argv.length < 7) {
    console.log("USAGE: ./ethTransaction nonce gasPrice outputAddr outputAmount privateKey");
    return;
  }

  const [
    _, __,
    nonce, gasPrice,
    outputAddr, outputAmount,
    privateKey
  ] = process.argv;

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
    gasPrice: Number(gasPrice),
    network: NETWORKS.ROPSTEN
  });

  console.log("Raw signed transaction:", rawSignedTx.tx);
}

main().catch(console.error)
