import SHA256 from 'crypto-js/sha256';

export function sha256(input: string): string {
  return SHA256(input).toString();
}
