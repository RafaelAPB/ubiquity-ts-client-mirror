import { Address, Networks, PrivateKey, PublicKey, Script, Transaction } from 'bitcore-lib';
import Web3 from "web3";
import { NETWORKS } from "./constants";
import { SignedTx } from "../generated/api";

// Custom exceptions
// ==========================
class NetworkNotFoundError extends Error {
  constructor(network: string) {
    const message = `Network ${network} not supported`;
    super(message);
    this.message = message;
    this.name = 'NetworkNotFoundError';
  }
}
// ==========================

class UnsignedTx {
  id: string;
  unsignedTx: string;

  constructor(id: string, unsignedTx: string) {
    this.id = id;
    this.unsignedTx = unsignedTx;
  }
}


type TxInput = {
  hash: string;
  index: number;
}

type TxOutput = {
  address: string;
  amount: number;
}

interface ICreateUnsignedTx {
  create: (from: TxInput[], to: TxOutput[]) => string
}

interface ICreateSignedTx<T> {
  createAndSign: (from: TxInput[], to: TxOutput[], key: string, options: T) => Promise<string>
}

interface IGetTxIdFromRawTx {
  getTxIdFromRawTransaction: (rawUnsignedTx: string) => string
}

function getBitcoinNetwork(network: string): Networks.Network {
  switch (network) {
    case NETWORKS.MAIN_NET:
      return Networks.mainnet;
    case NETWORKS.TEST_NET:
      return Networks.testnet;
    default:
      throw new NetworkNotFoundError(network);
  }
}

type BtcTxOptions = {
  network?: string;
}

export const btcTransaction = {
  // Creates an unsigned Bitcoin transaction
  create: (from: TxInput[], to: TxOutput[]) => {
    const utxos = from.map(({ hash, index }) => Transaction.UnspentOutput.fromObject({
      txId: hash,
      outputIndex: index,
      // value's not known yet, but it's fine to leave it 0 below
      satoshis: 0,
      // transaction is unsigned so script is not filled yet
      script: ""
    }));

    const transaction = new Transaction().from(utxos);
    for (const txOut of to) {
      transaction.to(txOut.address, txOut.amount);
    }

    // @ts-ignore: needs ts-ignore because type definition do not
    //    have parameters in the "serialize" method for some reason
    return transaction.serialize({
      disableAll: true,
    });
  },
  createAndSign: async (from: TxInput[], to: TxOutput[], key: string, options: BtcTxOptions) => {
    const unsignedTx = new Transaction(btcTransaction.create(from, to));
    const privateKeyObj = new PrivateKey(key);
    const publicKey = PublicKey.fromPrivateKey(privateKeyObj);

    const network = options.network || NETWORKS.TEST_NET;
    const address = new Address(publicKey, getBitcoinNetwork(network));
    const script = Script.fromAddress(address);
    const signedTxUtxos = unsignedTx.inputs.map((input) => Transaction.UnspentOutput.fromObject({
      txId: input.prevTxId.toString("hex"),
      outputIndex: 0,
      script,
      satoshis: 0,
    }));

    const signedTx = new Transaction().from(signedTxUtxos);

    signedTx.outputs = unsignedTx.outputs;

    return Promise.resolve(
    // @ts-ignore: needs ts-ignore because type definition do not
    //    have parameters in the "serialize" method for some reason
      signedTx.sign(privateKeyObj).serialize({
        disableAll: true,
      })
    );
  },
  getTxIdFromRawTransaction: (rawUnsignedTx: string) => {
    const unsignedTx = new Transaction(rawUnsignedTx);
    return unsignedTx.id;
  }
};

type EthTxOptions = {
  fee: number;
  gasPrice: number;
  txData?: string;
  network?: string;
}

const ETH_CHAIN_IDS = {
  [NETWORKS.MAIN_NET]: 1,
  [NETWORKS.ROPSTEN]: 3
};

export const ethTransaction = {
  // Creates a signed Ethereum transaction
  createAndSign: async (from: TxInput[], to: TxOutput[], key: string, options: EthTxOptions) => {
    if (to.length > 1) {
      throw new Error("Transactions with multiple outputs are currently not supported");
    }

    const fromObj = from[0];
    const toObj = to[0];

    const data = typeof (options.txData) !== "undefined" ? options.txData : "";

    const { fee, gasPrice } = options;
    const network = options.network || NETWORKS.ROPSTEN;

    const txObj = {
      chainId: ETH_CHAIN_IDS[network],
      nonce: fromObj.index,
      gasPrice: gasPrice,
      gas: fee,
      to: toObj.address,
      value: toObj.amount,
      data: data,
    };


    const web3 = new Web3();
    const { rawTransaction } = await web3.eth.accounts
      .signTransaction(txObj, key);

    return rawTransaction;
  }
};

export function create<T extends ICreateUnsignedTx & IGetTxIdFromRawTx>(from: TxInput[], to: TxOutput[], obj: T) {

  const rawUnsignedTx = obj.create(from, to);

  const unsignedTxId = obj.getTxIdFromRawTransaction(rawUnsignedTx);

  return new UnsignedTx(unsignedTxId, rawUnsignedTx)
}

export async function createAndSign<T>(from: TxInput[], to: TxOutput[], key: string, obj: ICreateSignedTx<T>, options: T) {

  const rawSignedTx = await obj.createAndSign(from, to, key, options);

  return { tx: rawSignedTx } as SignedTx;
}
