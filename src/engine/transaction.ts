import { ec as EC } from 'elliptic';
import { Transaction } from './types';
import { isValidAddress, isValidAmount, isValidFee } from '../utils/validation';
import { RateLimiter } from '../utils/rateLimit';

const ec = new EC('secp256k1');
const txRateLimiter = new RateLimiter(10, 60000); // 10 tx per minute

export const FEE_LEVELS = {
  HIGH: 0.001,
  STANDARD: 0.0005,
  ECONOMY: 0.0001,
};

/**
 * Creates a new transaction with validation and rate limiting.
 *
 * @param from - Sender address (0x...)
 * @param to - Recipient address (0x...)
 * @param amount - Amount to send
 * @param privateKey - Sender private key for signing
 * @param fee - Transaction fee (optional, default 0)
 * @param skipRateLimit - Whether to bypass the rate limit check (optional, default false)
 * @returns Signed Transaction object
 * @throws Error if validation fails or rate limit exceeded
 */
export function createTransaction(from: string, to: string, amount: number, privateKey: string, fee: number = 0, skipRateLimit: boolean = false): Transaction {
  if (!skipRateLimit && !txRateLimiter.canProceed()) {
    throw new Error("Transaction rate limit exceeded. Please wait.");
  }

  if (!isValidAddress(from)) throw new Error("Invalid sender address");
  if (!isValidAddress(to)) throw new Error("Invalid recipient address");
  if (!isValidAmount(amount)) throw new Error("Invalid amount");
  if (fee < 0 || (fee > 0 && !isValidFee(fee))) throw new Error("Invalid fee");

  const timestamp = Date.now();
  const tx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    from,
    to,
    amount,
    fee,
    signature: '',
    timestamp,
    status: 'pending',
  };

  const key = ec.keyFromPrivate(privateKey);
  const dataToSign = from + to + amount.toString() + fee.toString() + timestamp.toString();
  const signature = key.sign(dataToSign).toDER('hex');

  tx.signature = signature;
  return tx;
}

/**
 * Verifies the signature of a transaction.
 *
 * @param tx - The transaction to verify
 * @param publicKey - The public key of the sender
 * @returns True if signature is valid, false otherwise
 */
export function verifyTransaction(tx: Transaction, publicKey: string): boolean {
  if (!tx.signature) return false;

  try {
    // Strip 0x if present for elliptic
    const rawKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
    const key = ec.keyFromPublic(rawKey, 'hex');
    let dataToVerify;
    if (tx.fee !== undefined) {
      dataToVerify = tx.from + tx.to + tx.amount.toString() + tx.fee.toString() + tx.timestamp.toString();
    } else {
      dataToVerify = tx.from + tx.to + tx.amount.toString() + tx.timestamp.toString();
    }
    return key.verify(dataToVerify, tx.signature);
  } catch {
    return false;
  }
}

/**
 * Checks if a transaction is considered irreversible (confirmed).
 *
 * @param tx - The transaction to check
 * @returns True if confirmed
 */
export function isIrreversible(tx: Transaction): boolean {
  return tx.status === 'confirmed';
}
