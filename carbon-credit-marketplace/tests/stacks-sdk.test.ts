import { describe, it, expect, beforeEach } from 'vitest';
import { CarbonCreditMarketplaceSDK } from '../src/stacks-sdk';

describe('CarbonCreditMarketplaceSDK', () => {
  let sdk: CarbonCreditMarketplaceSDK;
  const testPrivateKey = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM01';

  beforeEach(() => {
    sdk = new CarbonCreditMarketplaceSDK(false); // testnet
  });

  describe('Contract Initialization', () => {
    it('should initialize with correct network settings', () => {
      expect(sdk).toBeDefined();
    });
  });

  describe('Credit Issuance', () => {
    it('should issue carbon credit with valid parameters', async () => {
      const result = await sdk.issueCredit(
        testPrivateKey,
        'PROJ-001',
        100,
        'VCS',
        1000000,
        50000000,
        'https://metadata.example.com/credit1'
      );
      
      expect(result).toBeDefined();
      expect(result.txId).toBeDefined();
    });

    it('should fail with invalid parameters', async () => {
      await expect(
        sdk.issueCredit(testPrivateKey, '', 0, 'VCS', 1000000, 0, '')
      ).rejects.toThrow();
    });
  });

  describe('Credit Trading', () => {
    it('should purchase credit with correct payment', async () => {
      const creditId = 1;
      const totalPrice = 5000000000; // 5000 STX
      
      const result = await sdk.purchaseCredit(testPrivateKey, creditId, totalPrice);
      expect(result).toBeDefined();
    });
  });

  describe('Credit Retirement', () => {
    it('should retire owned credit', async () => {
      const creditId = 1;
      const result = await sdk.retireCredit(testPrivateKey, creditId);
      expect(result).toBeDefined();
    });
  });

  describe('Admin Functions', () => {
    it('should add verified issuer', async () => {
      const issuerAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      const result = await sdk.addVerifiedIssuer(testPrivateKey, issuerAddress);
      expect(result).toBeDefined();
    });
  });

  describe('Read-only Functions', () => {
    it('should get credit information', async () => {
      const creditInfo = await sdk.getCredit(1);
      expect(creditInfo).toBeDefined();
      expect(creditInfo.creditId).toBe(1);
    });

    it('should get marketplace statistics', async () => {
      const stats = await sdk.getMarketplaceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalCredits).toBe('number');
    });
  });
});
