import { CarbonCreditMarketplaceSDK } from '../src/stacks-sdk';
import { StacksHelpers } from '../src/utils/stacks-helpers';
import { StacksMainnet } from '@stacks/network';

async function advancedExample() {
  // Initialize SDK and helpers
  const sdk = new CarbonCreditMarketplaceSDK(true);
  const helpers = new StacksHelpers(new StacksMainnet());
  
  // Example keys (use your own)
  const issuerKey = 'issuer-private-key-here';
  const buyerKey = 'buyer-private-key-here';
  const adminKey = 'admin-private-key-here';
  
  try {
    console.log('🌍 Carbon Credit Marketplace - Advanced Example');
    
    // 1. Add verified issuer (admin only)
    console.log('\n1. Adding verified issuer...');
    const issuerAddress = 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9';
    await sdk.addVerifiedIssuer(adminKey, issuerAddress);
    console.log('✅ Verified issuer added');
    
    // 2. Issue multiple carbon credits
    console.log('\n2. Issuing multiple carbon credits...');
    const credits = [
      {
        projectId: 'SOLAR-FARM-001',
        co2Tons: 1000,
        standard: 'GOLD',
        pricePerTon: 30000000, // 30 STX per ton
        metadata: 'https://ipfs.io/ipfs/QmSolarFarm001'
      },
      {
        projectId: 'WIND-POWER-002',
        co2Tons: 750,
        standard: 'VCS',
        pricePerTon: 28000000, // 28 STX per ton
        metadata: 'https://ipfs.io/ipfs/QmWindPower002'
      }
    ];
    
    const creditIds = [];
    for (const credit of credits) {
      const result = await sdk.issueCredit(
        issuerKey,
        credit.projectId,
        credit.co2Tons,
        credit.standard,
        2000000, // Expiry block
        credit.pricePerTon,
        credit.metadata
      );
      
      creditIds.push(result.txId);
      console.log(`✅ Credit ${credit.projectId} issued: ${result.txId}`);
      
      // Wait for transaction confirmation
      await helpers.waitForTransaction(result.txId);
    }
    
    // 3. Purchase carbon credits
    console.log('\n3. Purchasing carbon credits...');
    const creditToPurchase = 0; // First credit
    const totalPrice = 30000000000; // 30,000 STX (1000 tons * 30 STX)
    
    const purchaseResult = await sdk.purchaseCredit(
      buyerKey,
      creditToPurchase,
      totalPrice
    );
    
    console.log('✅ Credit purchased:', purchaseResult.txId);
    await helpers.waitForTransaction(purchaseResult.txId);
    
    // 4. Retire carbon credit for offsetting
    console.log('\n4. Retiring carbon credit...');
    const retireResult = await sdk.retireCredit(buyerKey, creditToPurchase);
    console.log('✅ Credit retired for carbon offsetting:', retireResult.txId);
    
    // 5. Monitor marketplace activity
    console.log('\n5. Monitoring marketplace statistics...');
    const finalStats = await sdk.getMarketplaceStats();
    console.log('📊 Final marketplace stats:', finalStats);
    
    // 6. Format and display transaction costs
    console.log('\n6. Transaction cost analysis:');
    for (const txId of creditIds) {
      try {
        const isValid = await helpers.validateTransaction(txId);
        console.log(`Transaction ${txId}: ${isValid ? '✅ Success' : '❌ Failed'}`);
      } catch (error) {
        console.log(`Transaction ${txId}: ⏳ Pending`);
      }
    }
    
    console.log('\n🎉 Advanced example completed successfully!');
    console.log('💡 This example demonstrated:');
    console.log('   - Multi-step workflow with verification');
    console.log('   - Transaction monitoring and validation');
    console.log('   - Complete carbon credit lifecycle');
    console.log('   - Error handling and recovery');
    
  } catch (error) {
    console.error('❌ Error in advanced example:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   - Check your private keys are valid');
    console.log('   - Ensure sufficient STX balance');
    console.log('   - Verify network connectivity');
    console.log('   - Check if issuer is verified');
  }
}

// Run the example
if (require.main === module) {
  advancedExample();
}

export { advancedExample };
