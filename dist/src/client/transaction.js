"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSign = exports.create = exports.ethTransaction = exports.btcTransaction = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const bitcore_lib_1 = require("bitcore-lib");
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("./constants");
// Custom exceptions
// ==========================
class NetworkNotFoundError extends Error {
    constructor(network) {
        const message = `Network ${network} not supported`;
        super(message);
        this.message = message;
        this.name = 'NetworkNotFoundError';
    }
}
// ==========================
class UnsignedTx {
    constructor(id, unsignedTx) {
        this.id = id;
        this.unsignedTx = unsignedTx;
    }
}
function getBitcoinNetwork(network) {
    switch (network) {
        case constants_1.NETWORKS.MAIN_NET:
            return bitcore_lib_1.Networks.mainnet;
        case constants_1.NETWORKS.TEST_NET:
            return bitcore_lib_1.Networks.testnet;
        default:
            throw new NetworkNotFoundError(network);
    }
}
exports.btcTransaction = {
    // Creates an unsigned Bitcoin transaction
    create: (from, to) => {
        const utxos = from.map(({ hash, index }) => bitcore_lib_1.Transaction.UnspentOutput.fromObject({
            txId: hash,
            outputIndex: index,
            // value's not known yet, but it's fine to leave it 0 below
            satoshis: 0,
            // transaction is unsigned so script is not filled yet
            script: ""
        }));
        const transaction = new bitcore_lib_1.Transaction().from(utxos);
        for (const txOut of to) {
            transaction.to(txOut.address, txOut.amount);
        }
        // @ts-ignore: needs ts-ignore because type definition do not
        //    have parameters in the "serialize" method for some reason
        return transaction.serialize({
            disableAll: true,
        });
    },
    createAndSign: (from, to, key, options) => __awaiter(void 0, void 0, void 0, function* () {
        const unsignedTx = new bitcore_lib_1.Transaction(exports.btcTransaction.create(from, to));
        const privateKeyObj = new bitcore_lib_1.PrivateKey(key);
        const publicKey = bitcore_lib_1.PublicKey.fromPrivateKey(privateKeyObj);
        const network = options.network || constants_1.NETWORKS.TEST_NET;
        const address = new bitcore_lib_1.Address(publicKey, getBitcoinNetwork(network));
        const script = bitcore_lib_1.Script.fromAddress(address);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signedTxUtxos = unsignedTx.inputs.map((input) => bitcore_lib_1.Transaction.UnspentOutput.fromObject({
            txId: input.prevTxId.toString("hex"),
            outputIndex: 0,
            script,
            satoshis: 0,
        }));
        const signedTx = new bitcore_lib_1.Transaction().from(signedTxUtxos);
        signedTx.outputs = unsignedTx.outputs;
        return Promise.resolve(
        // @ts-ignore: needs ts-ignore because type definition do not
        //    have parameters in the "serialize" method for some reason
        signedTx.sign(privateKeyObj).serialize({
            disableAll: true,
        }));
    }),
    getTxIdFromRawTransaction: (rawUnsignedTx) => {
        const unsignedTx = new bitcore_lib_1.Transaction(rawUnsignedTx);
        return unsignedTx.id;
    }
};
const ETH_CHAIN_IDS = {
    [constants_1.NETWORKS.MAIN_NET]: 1,
    [constants_1.NETWORKS.ROPSTEN]: 3
};
exports.ethTransaction = {
    // Creates a signed Ethereum transaction
    createAndSign: (from, to, key, options) => __awaiter(void 0, void 0, void 0, function* () {
        if (to.length > 1) {
            throw new Error("Transactions with multiple outputs are currently not supported");
        }
        const fromObj = from[0];
        const toObj = to[0];
        const data = typeof (options.txData) !== "undefined" ? options.txData : "";
        const { fee, gasPrice } = options;
        const network = options.network || constants_1.NETWORKS.ROPSTEN;
        const txObj = {
            chainId: ETH_CHAIN_IDS[network],
            nonce: fromObj.index,
            gasPrice: gasPrice,
            gas: fee,
            to: toObj.address,
            value: toObj.amount,
            data: data,
        };
        const web3 = new web3_1.default();
        const { rawTransaction } = yield web3.eth.accounts
            .signTransaction(txObj, key);
        return rawTransaction;
    })
};
function create(from, to, obj) {
    const rawUnsignedTx = obj.create(from, to);
    const unsignedTxId = obj.getTxIdFromRawTransaction(rawUnsignedTx);
    return new UnsignedTx(unsignedTxId, rawUnsignedTx);
}
exports.create = create;
function createAndSign(from, to, key, obj, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawSignedTx = yield obj.createAndSign(from, to, key, options);
        return { tx: rawSignedTx };
    });
}
exports.createAndSign = createAndSign;
