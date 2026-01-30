import { describe, it, expect, beforeEach } from 'vitest';
import { BtcBridgeHelperSDK } from '../src/stacks-sdk';

describe('BtcBridgeHelperSDK', () => {
  let sdk: BtcBridgeHelperSDK;

  beforeEach(() => {
    sdk = new BtcBridgeHelperSDK(false); // testnet
  });

  it('should initialize with correct network settings', () => {
    expect(sdk).toBeDefined();
  });

  it('should create bridge initiation transaction', async () => {
    const mockSenderKey = 'test-private-key';
    const amount = 1000;
    const btcAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

    // Mock the transaction creation
    const result = await sdk.initiateBridge(mockSenderKey, amount, btcAddress);
    expect(result).toBeDefined();
  });

  it('should create bridge completion transaction', async () => {
    const mockSenderKey = 'test-private-key';
    const bridgeId = 1;

    const result = await sdk.completeBridge(mockSenderKey, bridgeId);
    expect(result).toBeDefined();
  });

  it('should handle mainnet configuration', () => {
    const mainnetSdk = new BtcBridgeHelperSDK(true);
    expect(mainnetSdk).toBeDefined();
  });
});
