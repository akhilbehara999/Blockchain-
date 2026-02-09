import { ec as EC } from 'elliptic';
import { Transaction } from './types';

const ec = new EC('secp256k1');

export function createTransaction(from: string, to: string, amount: number, privateKey: string): Transaction {
  const timestamp = Date.now();
  const tx: Transaction = {
    from,
    to,
    amount,
    signature: '',
    timestamp,
  };

  const key = ec.keyFromPrivate(privateKey);
  const dataToSign = from + to + amount.toString() + timestamp.toString();
  const signature = key.sign(dataToSign).toDER('hex');

  tx.signature = signature;
  return tx;
}

export function verifyTransaction(tx: Transaction, publicKey: string): boolean {
  const key = ec.keyFromPublic(publicKey, 'hex');
  const dataToVerify = tx.from + tx.to + tx.amount.toString() + tx.timestamp.toString();
  return key.verify(dataToVerify, tx.signature);
}
