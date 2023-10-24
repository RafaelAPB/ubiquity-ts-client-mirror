import { SignedTx } from "../generated/api";
declare class UnsignedTx {
    id: string;
    unsignedTx: string;
    constructor(id: string, unsignedTx: string);
}
type TxInput = {
    hash: string;
    index: number;
};
type TxOutput = {
    address: string;
    amount: number;
};
interface ICreateUnsignedTx {
    create: (from: TxInput[], to: TxOutput[]) => string;
}
interface ICreateSignedTx<T> {
    createAndSign: (from: TxInput[], to: TxOutput[], key: string, options: T) => Promise<string>;
}
interface IGetTxIdFromRawTx {
    getTxIdFromRawTransaction: (rawUnsignedTx: string) => string;
}
type BtcTxOptions = {
    network?: string;
};
export declare const btcTransaction: {
    create: (from: TxInput[], to: TxOutput[]) => string;
    createAndSign: (from: TxInput[], to: TxOutput[], key: string, options: BtcTxOptions) => Promise<string>;
    getTxIdFromRawTransaction: (rawUnsignedTx: string) => string;
};
type EthTxOptions = {
    fee: number;
    gasPrice: number;
    txData?: string;
    network?: string;
};
export declare const ethTransaction: {
    createAndSign: (from: TxInput[], to: TxOutput[], key: string, options: EthTxOptions) => Promise<string>;
};
export declare function create<T extends ICreateUnsignedTx & IGetTxIdFromRawTx>(from: TxInput[], to: TxOutput[], obj: T): UnsignedTx;
export declare function createAndSign<T>(from: TxInput[], to: TxOutput[], key: string, obj: ICreateSignedTx<T>, options: T): Promise<SignedTx>;
export {};
