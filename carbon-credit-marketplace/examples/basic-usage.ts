import { CarbonCreditMarketplaceSDK } from '../src/stacks-sdk';

async function basicExample() {
  // Initialize SDK for mainnet
  const sdk = new CarbonCreditMarketplaceSDK(true);
  
  // Example private key (use your own)
  const senderKey = 'your-private-key-here';
  
  try {
    console.log('🌱 Carbon Credit Marketplace - Basic Example');
    
    // 1. Issue a carbon credit
    console.log('\n1. Issuing carbon credit...');
    const creditResult = await sdk.issueCredit(
      senderKey,
      'FOREST-PROJ-001',
      500, // 500 tons of CO2
      'VCS', // Verified Carbon Standard
      1000000, // Expiry block height
      25000000, // 25 STX per ton
      'https://ipfs.io/ipfs/QmExample123'
    );
    
    console.log('✅ Credit issued! Transaction ID:', creditResult.txId);
    
    // 2. Get credit information
    console.log('\n2. Getting credit information...');
    const creditInfo = await sdk.getCredit(0); // First credit
    console.log('📋 Credit info:', creditInfo);
    
    // 3. Get marketplace statistics
    console.log('\n3. Getting marketplace stats...');
    const stats = await sdk.getMarketplaceStats();
    console.log('📊 Marketplace stats:', stats);
    
    console.log('\n✨ Basic example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in basic example:', error);
  }
}

// Run the example
if (require.main === module) {
  basicExample();
}

export { basicExample };
