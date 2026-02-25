import { describe, it, expect, beforeEach } from 'vitest';
import { PredictionMarketSDK } from '../src/stacks-sdk';

describe('PredictionMarketSDK', () => {
  let sdk: PredictionMarketSDK;
  const testPrivateKey = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM01';

  beforeEach(() => {
    sdk = new PredictionMarketSDK(false); // testnet
  });

  describe('Market Creation', () => {
    it('should create prediction market with valid parameters', async () => {
      const result = await sdk.createMarket(
        testPrivateKey,
        'Will Bitcoin reach $100k by 2025?',
        'Prediction market for Bitcoin price reaching $100,000 by end of 2025',
        1000000, // end time
        1100000, // resolution time
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // oracle
        'crypto'
      );
      
      expect(result).toBeDefined();
      expect(result.txId).toBeDefined();
    });

    it('should fail with invalid time parameters', async () => {
      await expect(
        sdk.createMarket(
          testPrivateKey,
          'Invalid Market',
          'Description',
          100, // past time
          200,
          'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          'test'
        )
      ).rejects.toThrow();
    });
  });

  describe('Betting', () => {
    it('should place bet on market outcome', async () => {
      const marketId = 1;
      const betOnYes = true;
      const amount = 1000000; // 1 STX
      
      const result = await sdk.placeBet(testPrivateKey, marketId, betOnYes, amount);
      expect(result).toBeDefined();
    });

    it('should place bet on no outcome', async () => {
      const marketId = 1;
      const betOnYes = false;
      const amount = 2000000; // 2 STX
      
      const result = await sdk.placeBet(testPrivateKey, marketId, betOnYes, amount);
      expect(result).toBeDefined();
    });
  });

  describe('Market Resolution', () => {
    it('should resolve market with outcome', async () => {
      const marketId = 1;
      const outcome = true;
      
      const result = await sdk.resolveMarket(testPrivateKey, marketId, outcome);
      expect(result).toBeDefined();
    });
  });

  describe('Winnings', () => {
    it('should claim winnings after market resolution', async () => {
      const marketId = 1;
      const result = await sdk.claimWinnings(testPrivateKey, marketId);
      expect(result).toBeDefined();
    });
  });

  describe('Market Management', () => {
    it('should close market early', async () => {
      const marketId = 1;
      const result = await sdk.closeMarket(testPrivateKey, marketId);
      expect(result).toBeDefined();
    });
  });

  describe('Read-only Functions', () => {
    it('should get market information', async () => {
      const marketInfo = await sdk.getMarket(1);
      expect(marketInfo).toBeDefined();
      expect(marketInfo.marketId).toBe(1);
    });

    it('should get market odds', async () => {
      const odds = await sdk.getMarketOdds(1);
      expect(odds).toBeDefined();
      expect(typeof odds.yesOdds).toBe('number');
      expect(typeof odds.noOdds).toBe('number');
    });

    it('should calculate payout for user', async () => {
      const userAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
      const payout = await sdk.calculatePayout(1, userAddress);
      expect(payout).toBeDefined();
    });
  });
});
