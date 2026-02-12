import { ec as EC } from 'elliptic';
import { Transaction } from './types';

const ec = new EC('secp256k1');

export function createTransaction(from: string, to: string, amount: number, privateKey: string, fee: number = 0): Transaction {
  const timestamp = Date.now();
  const tx: Transaction = {
    from,
    to,
    amount,
    fee,
    signature: '',
    timestamp,
  };

  const key = ec.keyFromPrivate(privateKey);
  const dataToSign = from + to + amount.toString() + fee.toString() + timestamp.toString();
  const signature = key.sign(dataToSign).toDER('hex');

  tx.signature = signature;
  return tx;
}

export function verifyTransaction(tx: Transaction, publicKey: string): boolean {
  const key = ec.keyFromPublic(publicKey, 'hex');
  let dataToVerify;
  if (tx.fee !== undefined) {
    dataToVerify = tx.from + tx.to + tx.amount.toString() + tx.fee.toString() + tx.timestamp.toString();
  } else {
    dataToVerify = tx.from + tx.to + tx.amount.toString() + tx.timestamp.toString();
  }
  return key.verify(dataToVerify, tx.signature);
}
