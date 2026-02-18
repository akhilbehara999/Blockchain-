export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && num <= 1000000 &&
         /^\d+(\.\d{1,6})?$/.test(num.toString());
}
export function isValidFee(fee: string | number): boolean {
  const num = typeof fee === 'string' ? parseFloat(fee) : fee;
  return !isNaN(num) && num > 0 && num <= 1.0;
}
export function isValidAddress(address: string): boolean {
  // Allow up to 132 chars (0x + 130 for uncompressed key)
  return /^0x[a-fA-F0-9]{40,132}$/.test(address);
}
export function isValidGasLimit(gas: string | number): boolean {
  const num = typeof gas === 'string' ? parseInt(gas) : gas;
  return !isNaN(num) && num > 0 && num <= 10000000;
}
export function isValidPrice(price: string | number): boolean {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0;
}
export function isValidHash(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}
export function sanitizeInput(input: string): string {
  return input.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;',
    '"': '&quot;', "'": '&#x27;'
  }[char] || char));
}
