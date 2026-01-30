import { digitalwillSDK } from '../src/stacks-sdk';
import { StacksTestnet } from '@stacks/network';

// Basic usage example
async function basicExample() {
  // Initialize SDK
  const sdk = new digitalwillSDK(false); // testnet
  
  // Example private key (never use in production)
  const senderKey = 'your-private-key-here';
  
  try {
    // Execute a contract function
    const result = await sdk.executeFunction(
      senderKey,
      'example-function',
      []
    );
    
    console.log('Transaction result:', result);
    
    // Wait for confirmation
    if (result.txId) {
      const confirmed = await sdk.waitForConfirmation(result.txId);
      console.log('Transaction confirmed:', confirmed);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
basicExample();
