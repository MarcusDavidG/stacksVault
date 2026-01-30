import { secureescrowSDK } from '../src/stacks-sdk';
import { PerformanceAnalytics } from '../src/analytics/performance';
import { SecurityValidator } from '../src/security/validation';

// Advanced usage with analytics and security
async function advancedExample() {
  const sdk = new secureescrowSDK(false);
  const analytics = new PerformanceAnalytics();
  
  const senderKey = 'your-private-key-here';
  const userAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  // Validate inputs
  const addressValidation = SecurityValidator.validateAddress(userAddress);
  if (!addressValidation.isValid) {
    console.error('Invalid address:', addressValidation.errors);
    return;
  }
  
  try {
    // Batch operations
    const operations = [
      { functionName: 'function-1', args: [] },
      { functionName: 'function-2', args: [] }
    ];
    
    const startTime = Date.now();
    const results = await sdk.batchExecute(senderKey, operations);
    const endTime = Date.now();
    
    // Record analytics
    results.forEach((result, index) => {
      analytics.addTransaction({
        txId: result.txId || 'unknown',
        timestamp: Date.now(),
        gasUsed: 1000, // Would be actual gas used
        success: !!result.txId,
        confirmationTime: endTime - startTime,
        value: 0
      });
    });
    
    // Get performance metrics
    const metrics = analytics.getPerformanceMetrics();
    console.log('Performance metrics:', metrics);
    
  } catch (error) {
    console.error('Advanced example error:', error);
  }
}

advancedExample();
