# StacksVault

A collection of Clarity smart contracts for the Stacks blockchain with comprehensive Stacks SDK integration.

## 🚀 Major Update: Complete Stacks SDK Integration

**200 meaningful commits completed!** Every project now includes:

### ✨ Core Features Added
- **Stacks SDK Integration**: Complete integration with @stacks/transactions, @stacks/network, @stacks/auth, and @stacks/connect
- **Frontend Components**: React components with wallet connection and contract interaction
- **Comprehensive Testing**: Extensive test suites with coverage reporting
- **Security Features**: Input validation, access control, and security checks
- **Performance Analytics**: Transaction monitoring and user activity tracking
- **API Integration**: Real-time blockchain API integration and monitoring
- **Configuration Management**: Environment-specific configurations for testnet/mainnet
- **Documentation**: Complete usage guides, examples, and API documentation

### 🛠 Technical Enhancements
- **Advanced SDK Classes**: Custom SDK classes for each contract with batch operations
- **Helper Utilities**: Balance checking, transaction validation, and confirmation waiting
- **Security Validation**: Address validation, amount checking, and input sanitization
- **Access Control**: Role-based permissions and user management
- **Monitoring Services**: Contract health checks and performance metrics
- **Analytics Dashboard**: User activity tracking and usage statistics

## Projects

*   **btc-bridge-helper**: A helper contract for the Stacks bridge.
*   **btc-bridge-helper-v2**: A helper contract for the Stacks bridge (v2).
*   **btc-bridge-helper-v3**: A helper contract for the Stacks bridge (v3).
*   **btc-bridge-helper-v4**: A helper contract for the Stacks bridge (v4).
*   **contract-verifier**: A contract for verifying other contracts and managing trust.
*   **contract-verifier-v2**: A contract for verifying other contracts and managing trust (v2).
*   **contract-verifier-v3**: A contract for verifying other contracts and managing trust (v3).
*   **contract-verifier-v4**: A contract for verifying other contracts and managing trust (v4).
*   **crowdfund-platform**: A contract for crowdfunding campaigns.
*   **crowdfund-platform-v2**: A contract for crowdfunding campaigns (v2).
*   **crowdfund-platform-v3**: A contract for crowdfunding campaigns (v3).
*   **crowdfund-platform-v4**: A contract for crowdfunding campaigns (v4).
*   **dao-governance**: A contract for decentralized autonomous organization governance.
*   **dao-governance-v2**: A contract for decentralized autonomous organization governance (v2).
*   **dao-governance-v3**: A contract for decentralized autonomous organization governance (v3).
*   **dao-governance-v4**: A contract for decentralized autonomous organization governance (v4).
*   **decentralized-lottery**: A contract for a decentralized lottery.
*   **decentralized-lottery-v2**: A contract for a decentralized lottery (v2).
*   **decentralized-lottery-v3**: A contract for a decentralized lottery (v3).
*   **decentralized-lottery-v4**: A contract for a decentralized lottery (v4).
*   **insurance-pool**: A contract for an insurance pool.
*   **insurance-pool-v2**: A contract for an insurance pool (v2).
*   **insurance-pool-v3**: A contract for an insurance pool (v3).
*   **insurance-pool-v4**: A contract for an insurance pool (v4).
*   **lending-pool**: A contract for a decentralized lending pool.
*   **lending-pool-v2**: A contract for a decentralized lending pool (v2).
*   **lending-pool-v3**: A contract for a decentralized lending pool (v3).
*   **lending-pool-v4**: A contract for a decentralized lending pool (v4).
*   **multisig-wallet**: A contract for a multi-signature wallet.
*   **multisig-wallet-v2**: A contract for a multi-signature wallet (v2).
*   **multisig-wallet-v3**: A contract for a multi-signature wallet (v3).
*   **multisig-wallet-v4**: A contract for a multi-signature wallet (v4).
*   **name-registry**: A contract for a name registry.
*   **name-registry-v2**: A contract for a name registry (v2).
*   **name-registry-v3**: A contract for a name registry (v3).
*   **nft-marketplace**: A contract for an NFT marketplace.
*   **nft-marketplace-v2**: A contract for an NFT marketplace (v2).
*   **nft-marketplace-v3**: A contract for an NFT marketplace (v3).
*   **nft-marketplace-v4**: A contract for an NFT marketplace (v4).
*   **oracle-registry**: A contract for an oracle registry.
*   **oracle-registry-v2**: A contract for an oracle registry (v2).
*   **oracle-registry-v3**: A contract for an oracle registry (v3).
*   **oracle-registry-v4**: A contract for an oracle registry (v4).
*   **royalty-splitter**: A contract for splitting royalties.
*   **royalty-splitter-v2**: A contract for splitting royalties (v2).
*   **royalty-splitter-v3**: A contract for splitting royalties (v3).
*   **royalty-splitter-v4**: A contract for splitting royalties (v4).
*   **secure-escrow**: A contract for a secure escrow service.
*   **secure-escrow-v2**: A contract for a secure escrow service (v2).
*   **secure-escrow-v3**: A contract for a secure escrow service (v3).
*   **secure-escrow-v4**: A contract for a secure escrow service (v4).
*   **time-locked-vault-v1**: A contract for time-locking STX tokens.
*   **digital-will-v2**: A time-locked inheritance contract.
*   **digital-will-v3**: A time-locked inheritance contract (v3).
*   **digital-will-v4**: A time-locked inheritance contract (v4).

## 🚀 New Mainnet-Ready Contracts (2026)

*   **carbon-credit-marketplace**: Trade verified carbon credits with marketplace functionality
*   **prediction-market**: Decentralized betting on future events with oracle resolution
*   **subscription-manager**: Recurring payment management for SaaS and services
*   **reputation-system**: On-chain reputation scoring with staking mechanisms
*   **asset-tokenizer**: Tokenize real-world assets for fractional ownership

## 🔧 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Clarinet CLI
- Stacks wallet for testing

### Installation
```bash
# Clone the repository
git clone https://github.com/MarcusDavidG/stacksVault.git
cd stacksVault

# Install dependencies for any project
cd btc-bridge-helper
npm install
```

### Usage Example
```typescript
import { BtcBridgeHelperSDK } from './src/stacks-sdk';

// Initialize SDK
const sdk = new BtcBridgeHelperSDK(false); // false for testnet

// Execute contract function
const result = await sdk.executeFunction(senderKey, 'function-name', args);

// Wait for confirmation
const confirmed = await sdk.waitForConfirmation(result.txId);
```

### Testing
```bash
npm test                # Run all tests
npm run test:sdk        # Run SDK tests
npm run test:coverage   # Run with coverage
```

## 📊 Project Statistics

- **Total Projects**: 55+ smart contracts (5 new mainnet-ready)
- **SDK Integration**: 100% coverage across all contracts
- **Test Coverage**: Comprehensive test suites with analytics
- **Documentation**: Complete API documentation and examples
- **Security Features**: Advanced validation and access control
- **Performance Monitoring**: Real-time analytics and monitoring
- **Mainnet Ready**: 5 production-ready contracts for immediate deployment

## 🏗 Architecture

Each project includes:
- **Smart Contract**: Clarity contract with core functionality
- **SDK Integration**: TypeScript SDK for easy interaction
- **Frontend Components**: React components with wallet integration
- **Testing Suite**: Comprehensive test coverage
- **Security Layer**: Validation and access control
- **Analytics**: Performance monitoring and user tracking
- **Documentation**: Complete usage guides and examples

## 🔐 Security Features

- Input validation and sanitization
- Role-based access control
- Transaction security checks
- Address and amount validation
- Comprehensive error handling
- Security audit trails

## 📈 Analytics & Monitoring

- Real-time transaction monitoring
- User activity tracking
- Performance metrics
- Gas optimization insights
- Contract health checks
- Network status monitoring

## SDK Integrations (V1 Projects)

All V1 mini-projects now include WalletConnect SDK integration for wallet connection and smart contract interactions. Each project's `frontend` directory contains a basic React application demonstrating core functionalities.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Stacks ecosystem**