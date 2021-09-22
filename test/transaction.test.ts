import { btcTransaction, ethTransaction, create, createAndSign, NETWORKS } from "../src/client";

test("creates an unsigned bitcoin transaction with single input", async () => {
  const from = [{
    "hash":
      "6b4510d1dd716f49c6c701d8d0ad47af3d07847660dc4e1b25e10516714a7f31",
    "index": 0
  }];

  const to = [{
    "address": "mmDDkcfXF5co6itzXrivWyxut7XifYywtR",
    "amount": 97990
  }, {
    "address": "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt",
    "amount": 10
  }];

  const unsignedTx = create(from, to, btcTransaction);

  const unsignedExpected = {
    "id": "d361e8215940348140aae07b503227f002d80ebb8216f8ce99849ff47ff1aa4d",
    "unsignedTx": "0200000001317f4a711605e1251b4edc607684073daf47add0d801c7c6496f71ddd110456b0000000000ffffffff02c67e0100000000001976a9143e762bc9a952a0aeb30c79491921151e7d412f6b88ac0a000000000000001976a914344a0f48ca150ec2b903817660b9b68b13a6702688ac00000000"
  };
  expect(unsignedTx).toEqual(unsignedExpected);
});


test("creates a signed bitcoin transaction with single input", async () => {
  const signingKey = "92VNZDvn5NWbtALVxv6s1cKdKVq4Udd6zQ6SxgVK87qE3x7gZEZ";

  const from = [{
    "hash":
      "6b4510d1dd716f49c6c701d8d0ad47af3d07847660dc4e1b25e10516714a7f31",
    "index": 0
  }];
  const to = [{
    "address": "mmDDkcfXF5co6itzXrivWyxut7XifYywtR",
    "amount": 97990
  }, {
    "address": "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt",
    "amount": 10
  }];

  const signedTx = await createAndSign(from, to, signingKey, btcTransaction, { network: NETWORKS.TEST_NET });

  const signedExpected = {
    tx: "0200000001317f4a711605e1251b4edc607684073daf47add0d801c7c6496f71ddd110456b000000008b483045022100f152d4e3d61e8c9427496aafc59e1de4b9b04ede871552a8c72890e3c290302102201fea66f439ed3714e0b3f1a9259db25075ab6171bcc5be6f6fbe9279e087e290014104a8db88ba9cc7ee9f5530e87a2a523d2fa9a4cfd1923c756c6590cdb7dd12745ee0a641a6b4314a5dbd251d7a8157dc8d0f20df2aa01b606f543902e523d5b9d1ffffffff02c67e0100000000001976a9143e762bc9a952a0aeb30c79491921151e7d412f6b88ac0a000000000000001976a914344a0f48ca150ec2b903817660b9b68b13a6702688ac00000000"
  };

  expect(signedTx).toEqual(signedExpected);

});


test("creates a signed bitcoin transaction with multiple inputs", async () => {
  const signingKey = "92VNZDvn5NWbtALVxv6s1cKdKVq4Udd6zQ6SxgVK87qE3x7gZEZ"

  const from = [{
    "hash":
      "a287e3d84fca57bc06d7d0b04e8fcf0bae2226dd27f077709b40e7168eba89d9",
    "index": 0
  }, {
    "hash":
      "6c8c9213b2e10f2fef032d08c6dddf24bbb85109437abbe434e8ae53bde2e859",
    "index": 0
  }]

  const to = [{
    "address": "mmDDkcfXF5co6itzXrivWyxut7XifYywtR",
    "amount": 119000
  }, {
    "address": "mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt",
    "amount": 1000
  }]

  const signedTx = await createAndSign(from, to, signingKey, btcTransaction, { network: NETWORKS.TEST_NET });

  const signedExpected = { tx: "0200000002d989ba8e16e7409b7077f027dd2622ae0bcf8f4eb0d0d706bc57ca4fd8e387a2000000008b483045022100acba16257f1f2c70aecfd8f3c2aa4fb8bcbfd6bf0520005bd3aca2cdb2f872f2022000917e28475cca706a90c4e0a622b10a2431b0553b0f72d7d0a23de33c9953ff014104a8db88ba9cc7ee9f5530e87a2a523d2fa9a4cfd1923c756c6590cdb7dd12745ee0a641a6b4314a5dbd251d7a8157dc8d0f20df2aa01b606f543902e523d5b9d1ffffffff59e8e2bd53aee834e4bb7a430951b8bb24dfddc6082d03ef2f0fe1b213928c6c000000008a47304402204ac62b66e07cdc835e8be57db131c764c8a8d3052d71a61a87c3689bf50af0b50220080033eb6c96e3af09e0967fcfed6cf94db6f4a103fa15cc05840a90deb3c2b4014104a8db88ba9cc7ee9f5530e87a2a523d2fa9a4cfd1923c756c6590cdb7dd12745ee0a641a6b4314a5dbd251d7a8157dc8d0f20df2aa01b606f543902e523d5b9d1ffffffff02d8d00100000000001976a9143e762bc9a952a0aeb30c79491921151e7d412f6b88ace8030000000000001976a914344a0f48ca150ec2b903817660b9b68b13a6702688ac00000000" }
  expect(signedTx).toEqual(signedExpected);
})

test("creates a signed ethereum transaction with a single output", async () => {

  const signingKey = "1a96c5f08783afbd792d78212df8542fee62d79d33264626e225344de2c89742";

  const from = [{
    "hash": "0xb77aC006Bfe3C860441Fb3bD0726Fe57C0428aa9",
    "index": 3
  }];
  const to = [{
    "address": "0x78c115F1c8B7D0804FbDF3CF7995B030c512ee78",
    "amount": 10 ** 18
  }];

  const fee = 21000;

  const signedTx = await createAndSign(from, to, signingKey, ethTransaction, {
    "gasPrice": 21000000000,
    "fee": fee
  });

  const signedExpected = { "tx": "0xf86c038504e3b292008252089478c115f1c8b7d0804fbdf3cf7995b030c512ee78880de0b6b3a7640000802aa04c107a5155e637309556de219e03153ad223459563379a0f64fc7bc73a204b76a0312bee877bcd329501d29679f468c4992cd89ff4af06ad513a2a51e7e1608585" }
  expect(signedTx).toEqual(signedExpected);
});

test("throws exception on multiple outputs", async () => {
  const signingKey = "key";

  const from = [{ "hash": "from", "index": 0 }]
  const to = [{
    "address": "dest1",
    "amount": 1
  }, {
    "address": "dest2",
    "amount": 1
  }]

  expect(() =>
    createAndSign(from, to, signingKey, ethTransaction, {
      "gasPrice": 21000000000,
      "fee": 0,
    })
  ).rejects.toThrow(new Error("Transactions with multiple outputs are currently not supported"));

});

