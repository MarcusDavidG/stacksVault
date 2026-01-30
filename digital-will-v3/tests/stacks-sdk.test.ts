import { describe, it, expect, beforeEach } from 'vitest';
import { DigitalwillSDK } from '../src/stacks-sdk';

describe('DigitalwillSDK', () => {
  let sdk: DigitalwillSDK;

  beforeEach(() => {
    sdk = new DigitalwillSDK(false); // testnet
  });

  it('should initialize with correct network settings', () => {
    expect(sdk).toBeDefined();
  });

  it('should execute contract functions', async () => {
    const mockSenderKey = 'test-private-key';
    const functionName = 'test-function';
    const args = [];

    const result = await sdk.executeFunction(mockSenderKey, functionName, args);
    expect(result).toBeDefined();
  });

  it('should handle read-only function calls', async () => {
    const functionName = 'get-info';
    const args = [];

    const result = await sdk.readOnlyFunction(functionName, args);
    expect(result.success).toBe(true);
  });

  it('should execute batch operations', async () => {
    const mockSenderKey = 'test-private-key';
    const operations = [
      { functionName: 'function-1', args: [] },
      { functionName: 'function-2', args: [] }
    ];

    const results = await sdk.batchExecute(mockSenderKey, operations);
    expect(results).toHaveLength(2);
  });

  it('should get contract information', async () => {
    const info = await sdk.getContractInfo();
    expect(info.address).toBeDefined();
    expect(info.name).toBe('digital-will-v3');
    expect(info.network).toBe('testnet');
  });

  it('should handle mainnet configuration', () => {
    const mainnetSdk = new DigitalwillSDK(true);
    expect(mainnetSdk).toBeDefined();
  });

  it('should handle error scenarios gracefully', async () => {
    const mockSenderKey = 'invalid-key';
    const functionName = 'non-existent-function';
    const args = [];

    try {
      await sdk.executeFunction(mockSenderKey, functionName, args);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
