import { btcTransaction, createAndSign, NETWORKS } from "@ubiquity/ubiquity-ts-client";

async function main() {
  if (process.argv.length < 9) {
    console.log("USAGE: ./btcTransaction inputTxHash txIndex senderAddr outputAddr outputAmount totalAmount privateKey");
    return;
  }

  const [
    _, __,
    inputTxHash, txIndex, senderAddr,
    outputAddr, outputAmount,
    totalAmount, privateKey
  ] = process.argv;

  const input = [
    {
      hash: inputTxHash,
      index: Number(txIndex)
    }
  ];

  const fee = 1000;
  const changeAmount = Number(totalAmount) - fee - Number(outputAmount);
  const outputs = [
    {
      address: senderAddr,
      amount: changeAmount
    },
    {
      address: outputAddr,
      amount: Number(outputAmount)
    }
  ];

  const rawSignedTx = await createAndSign(input, outputs, privateKey, btcTransaction, { network: NETWORKS.TEST_NET });

  console.log("Raw signed transaction:", rawSignedTx.tx);
}

main()
  .catch(console.error)
