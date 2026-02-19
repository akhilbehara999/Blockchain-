import { describe, it, expect } from 'vitest';
import { isValidAddress } from '../utils/validation';

describe('isValidAddress length validation', () => {
  it('should validate addresses with length 40 hex chars after 0x', () => {
    const addr = '0x' + 'a'.repeat(40);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('should validate uncompressed public keys (130 hex chars after 0x)', () => {
    const addr = '0x' + 'a'.repeat(130);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('should validate compressed public keys (66 hex chars after 0x)', () => {
    const addr = '0x' + 'a'.repeat(66);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('should validate addresses up to 200 hex chars after 0x', () => {
    const addr = '0x' + 'a'.repeat(200);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('should fail for addresses with less than 40 hex chars after 0x', () => {
    const addr = '0x' + 'a'.repeat(39);
    expect(isValidAddress(addr)).toBe(false);
  });

  it('should fail for addresses with more than 200 hex chars after 0x', () => {
    const addr = '0x' + 'a'.repeat(201);
    expect(isValidAddress(addr)).toBe(false);
  });

  it('should fail for addresses without 0x prefix', () => {
    const addr = 'a'.repeat(40);
    expect(isValidAddress(addr)).toBe(false);
  });

  it('should fail for non-hex characters', () => {
    const addr = '0x' + 'g'.repeat(40);
    expect(isValidAddress(addr)).toBe(false);
  });

  it('should fail for non-string inputs', () => {
    expect(isValidAddress(null as any)).toBe(false);
    expect(isValidAddress(undefined as any)).toBe(false);
    expect(isValidAddress(123 as any)).toBe(false);
    expect(isValidAddress({} as any)).toBe(false);
  });
});
