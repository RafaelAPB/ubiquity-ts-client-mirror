# Ubiquity TypeScript client

A TypeScript client to the Ubiquity service of blockdaemon.com.

# Building

To build and compile the TypeScript sources to JavaScript use:

```
npm install
npm run build
```

# Dependency

To pull the client from the gitlab repo, you will need to add some configuration to ".npmrc":

```bash
echo "@ubiquity:registry=https://gitlab.com/api/v4/projects/27274533/packages/npm/">>.npmrc
echo "//gitlab.com/api/v4/projects/27274533/packages/npm/:_authToken=${AUTH_TOKEN}">>.npmrc
echo "always-auth=true">>.npmrc
```

# Usage

Create the client by providing an auth token:

```typescript
const client = new UbiquityClient("Auth Token Here");
```

## Blocks API

All of the APIs return a promise of type AxiosResponse<T>:

```typescript
client.blocksApi
  .getBlock(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET, "685700")
  .then((balance: AxiosResponse) => console.log(balance.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

The current block or block identifier can be retrieved using the "current" special identifier:

```typescript
client.blocksApi
  .getBlockIdentifier(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET, "current")
  .then((balance: AxiosResponse) => console.log(balance.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

## Accounts API

Initial request to paged APIs should not include a continuation. If no limit is supplied, the default of 25 will be applied. A filter can also be applied to select the returned assets.

```typescript
client.accountsApi
  .getTxsByAddress(
    PROTOCOL.LITECOIN,
    NETWORKS.MAIN_NET,
    "ltc1q6sfr0xfrz7ajzxwvdegs3frrqrfa7mcdhyr202"
  );
```

To continue through the pages of transactions, the continuation from the previous page must be supplied to the next request:

```typescript
    .then((txsPage1: AxiosResponse<TxPage>) => {
      console.log(txsPage1.data);
      client.accountsApi
        .getTxsByAddress(
          PROTOCOL.LITECOIN,
          NETWORKS.MAIN_NET,
          "ltc1q6sfr0xfrz7ajzxwvdegs3frrqrfa7mcdhyr202",
          "desc",
          txsPage1.data.continuation
        )
        .then((txPage2: AxiosResponse<TxPage>) => console.log("txs: ", txPage2.data))
        .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));
    })
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));
```

## Platforms API

To get the platform info:

```typescript
client.platformsApi
  .getPlatformEndpoints(PROTOCOL.POLKADOT, NETWORKS.MAIN_NET)
  .then((balance: AxiosResponse) => console.log(balance.data))
  .catch((r: any) => console.log(r));
```

## Sync API

To get the current block height:

```typescript
client.syncApi
  .currentBlockNumber(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET)
  .then((syncData: AxiosResponse<number>) => console.log(syncData.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

To get the current block ID:

```typescript
client.syncApi
  .currentBlockID(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET)
  .then((syncData: AxiosResponse<string>) => console.log(syncData.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

## Transactions API

To get all transactions on the platform, starting with the latest one:

```typescript
client.transactionsApi
  .getTxs(PROTOCOL.BITCOIN_CASH, NETWORKS.MAIN_NET)
  .then((syncData: AxiosResponse<TxPage>) => console.log(syncData.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

To get a transaction by hash:

```typescript
client.transactionsApi
  .getTx(
    PROTOCOL.TEZOS,
    NETWORKS.MAIN_NET,
    "onhbU4nd1A9BrvAsWx5QHfQMhjcmJtC5dzpmwxrycdt7FbYcQ7L"
  )
  .then((syncData: AxiosResponse<Tx>) => console.log(syncData.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

## Generated client

The generated clients can be used directly for lower-level control or in the case of early stage features.

```typescript
const configuration = new Configuration({
  accessToken: "Auth Token Here",
  basePath: "https://ubiquity.api.blockdaemon.com/v1",
});

const blockApi = new BlocksApi(configuration);
blockApi
  .getBlock(
    PROTOCOL.BITCOIN,
    NETWORKS.MAIN_NET,
    "00000000000000000001a031c7ff632e6a8c1d95852468aaa17d8cacde17b6de"
  )
  .then((r: AxiosResponse<Block>) => console.log(r.data))
  .catch((e: any) =>
    console.log(`error code::${e.response.status} url::${e.config.url}`)
  );
```

## Working with transactions
### Creating and signing transactions

Transactions can be created and signed directly from the SDK. Currently supported platforms are Bitcoin and Ethereum.

To create and sign a transaction that sends 0.0001 BTC (10000 satoshis) with a 0.00001 BTC (1000 satoshis) fee from an account to another in Bitcoin's testnet:

```typescript
import { btcTransaction, createAndSign, NETWORKS } from "@ubiquity/ubiquity-ts-client";

const privateKey = "<privateKey>";

const input = [
  {
    hash: "<input transaction>",
    index: <input transaction index>
  }
];

const outputs = [
  {
    address: "<destination address>",
    amount: 10000
  }
];

async function main() {
  const rawSignedTx = await createAndSign(input, outputs, privateKey, btcTransaction, { network: NETWORKS.TEST_NET });

  console.log("Raw signed transaction:", rawSignedTx.tx);
}

main().catch(console.error);

```

For Bitcoin an unsigned transaction can also be created with the function `TransactionCreation.create`.

To create and sign a transaction that sends 1 ETH from an account to another with a gas price of `1509999997` and a gas limit of `21000`:

```typescript
import { createAndSign, ethTransaction, NETWORKS } from "@ubiquity/ubiquity-ts-client";

const privateKey = "<privateKey>";

const input = [
  {
    hash: "", // for ETH input hash is not needed
    index: <nonce>
  }
];

const fee = 21000;
const gasPrice = 1509999997;
const outputs = [
  {
    address: "<destination address>",
    amount: 10 ** 18
  }
];

async function main() {
  const rawSignedTx = await createAndSign(input, outputs, privateKey, ethTransaction, {
    fee: fee,
    gasPrice,
    network: NETWORKS.ROPSTEN
  });

  console.log("Raw signed transaction:", rawSignedTx.tx);
}

main().catch(console.error);

```
For Ethereum only transactions with a single output are currently supported.

#### Broadcasting signed transactions

After a transaction is created and signed, it can be broadcasted through Ubiquity's `/tx/send` endpoint, which is interfaced through the `txSend` method:

```typescript
...

async function main() {
  const apiClient = new UbiquityClient("Auth Token Here");

  const rawSignedTx = {
    tx: "<raw transaction payload here>"
  };

  console.log("Sending transaction to the network...");

  const txSendResponse = await apiClient.transactionsApi.txSend(PROTOCOL.BITCOIN, NETWORKS.TEST_NET, rawSignedTx);

  console.log("Transaction id: ", txSendResponse.data.id);

}

main().catch(console.error)
```

#### Estimating fees

Ubiquity's `/tx/estimate_fee` endpoint returns an estimation of the fee value required for transactions to be pushed to the network. It can be used through the `feeEstimate()` method.

For Ethereum, this endpoint returns the average gas price obtained from the network:

```typescript
...

async function main() {
  const apiClient = new UbiquityClient("Auth Token Here");
  
  const feeResponse = await apiClient.transactionsApi.feeEstimate(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET);

  console.log("Fee estimate: ", feeResponse.data);

}

main().catch(console.error)
```

## Websockets support 
### Blocks
```typescript
  const client = new UbiquityClient("---> Auth Token Here");

  // Call the connect function to create a new websocket
  const ws = client.ws.connect(PROTOCOL.ETHEREUM, NETWORKS.MAIN_NET);

  const blocksub: Subscription= {
    type:    WS_CHANNELS.BLOCK,
    handler: (_ws: UbiWebsocket, block: BlockItem) => {
      console.log(block);
    }
  };
  
  ws.subscribe(blocksub).then(()=>{
    ws.unsubscribe(blocksub);
  });
```

### Block Identifiers
```typescript
  const blockIdentSub: Subscription = {
    type:     WS_CHANNELS.BLOCK_IDENTIFIERS,
    handler:  (ws: UbiquityWsClient, ident: BlockIdentifier) => {
      console.log(ident);
      ws.unsubscribe(blockIdentSub);
    }
  };

  ws.subscribe(blockIdentSub);  
```

### Tx
```typescript
  const txSub: Subscription = {
    type:     WS_CHANNELS.TX,
    handler:  (ws: UbiquityWsClient, tx: Tx) => {
      console.log(tx);
    }
  };

  ws.subscribe(txSub);
```

The messages received may also be filtered based on an address:

```typescript
  const txSub: Subscription = {
    type:     WS_CHANNELS.TX,
    handler:  (ws: UbiquityWsClient, tx: Tx) => {
      console.log(tx);
    },
    detail: { addresses: ["0x78c115F1c8B7D0804FbDF3CF7995B030c512ee78"] }
  };

  ws.subscribe(txSub);
```

