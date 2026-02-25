# Mainnet Deployment Guide

This guide covers deploying the 5 new mainnet-ready smart contracts to Stacks mainnet.

## New Mainnet Contracts (2026)

1. **Carbon Credit Marketplace** - Trade verified carbon credits
2. **Prediction Market** - Decentralized betting platform
3. **Subscription Manager** - Recurring payment management
4. **Reputation System** - On-chain reputation scoring
5. **Asset Tokenizer** - Real-world asset tokenization

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] Clarinet CLI installed and configured
- [ ] Mainnet STX wallet with sufficient balance
- [ ] Private keys securely stored

### 2. Contract Verification
- [ ] All contracts pass unit tests
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Integration tests successful

### 3. Network Configuration
- [ ] Mainnet endpoints configured
- [ ] API keys and credentials set
- [ ] Monitoring systems ready
- [ ] Backup procedures in place

## Deployment Steps

### 1. Carbon Credit Marketplace
```bash
cd carbon-credit-marketplace
npm install
npm test
npm run deploy:mainnet
```

### 2. Prediction Market
```bash
cd prediction-market
npm install
npm test
npm run deploy:mainnet
```

### 3. Subscription Manager
```bash
cd subscription-manager
npm install
npm test
npm run deploy:mainnet
```

### 4. Reputation System
```bash
cd reputation-system
npm install
npm test
npm run deploy:mainnet
```

### 5. Asset Tokenizer
```bash
cd asset-tokenizer
npm install
npm test
npm run deploy:mainnet
```

## Post-Deployment Verification

### 1. Contract Verification
- [ ] Verify contract deployment on Stacks Explorer
- [ ] Test basic contract functions
- [ ] Verify contract ownership
- [ ] Check initial state variables

### 2. SDK Integration
- [ ] Update SDK contract addresses
- [ ] Test SDK functionality
- [ ] Verify transaction flows
- [ ] Update documentation

### 3. Monitoring Setup
- [ ] Configure contract monitoring
- [ ] Set up alerting systems
- [ ] Enable analytics tracking
- [ ] Test emergency procedures

## Mainnet Contract Addresses

After deployment, update these addresses in your applications:

```typescript
// Mainnet contract addresses (update after deployment)
const MAINNET_CONTRACTS = {
  carbonCreditMarketplace: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.carbon-credit-marketplace',
  predictionMarket: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.prediction-market',
  subscriptionManager: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.subscription-manager',
  reputationSystem: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.reputation-system',
  assetTokenizer: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.asset-tokenizer'
};
```

## Security Considerations

### 1. Access Control
- Verify admin functions are properly protected
- Test role-based permissions
- Confirm multi-signature requirements
- Validate emergency controls

### 2. Economic Security
- Review fee structures and limits
- Test edge cases and boundary conditions
- Verify overflow/underflow protection
- Confirm stake requirements

### 3. Operational Security
- Secure private key management
- Regular security monitoring
- Incident response procedures
- Backup and recovery plans

## Maintenance and Updates

### 1. Regular Monitoring
- Contract health checks
- Performance metrics
- User activity tracking
- Error rate monitoring

### 2. Community Engagement
- User feedback collection
- Feature request tracking
- Bug report management
- Documentation updates

### 3. Future Upgrades
- Version planning
- Migration strategies
- Backward compatibility
- User communication

## Support and Resources

- **Documentation**: Each contract includes comprehensive README
- **Examples**: Usage examples in `/examples` directories
- **Tests**: Full test suites for validation
- **SDK**: TypeScript SDKs for easy integration

## Emergency Procedures

In case of critical issues:

1. **Immediate Response**
   - Pause affected contracts if possible
   - Notify users through official channels
   - Assess impact and scope

2. **Investigation**
   - Analyze transaction logs
   - Review contract state
   - Identify root cause

3. **Resolution**
   - Implement fixes if possible
   - Deploy patches or new versions
   - Communicate resolution to users

## Success Metrics

Track these metrics post-deployment:

- **Adoption**: Number of users and transactions
- **Performance**: Gas usage and execution times
- **Security**: No critical vulnerabilities
- **Reliability**: Uptime and error rates
- **Community**: User feedback and engagement

---

**Ready for Mainnet Deployment** 🚀

These contracts have been thoroughly tested and are production-ready for Stacks mainnet deployment.
