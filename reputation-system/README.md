# Reputation System

A decentralized reputation scoring system with staking mechanisms on the Stacks blockchain.

## Features

- **Multi-Category Reputation**: Separate scores for different domains
- **Staking Mechanism**: Stake STX to increase rating credibility
- **Reputation Decay**: Time-based reputation decay for freshness
- **Verification System**: Validator network for rating verification
- **Challenge Mechanism**: Dispute resolution for contested ratings
- **Weighted Scoring**: Stake-weighted reputation calculations

## Reputation Categories

- **General (0)**: Overall reputation score
- **Trading (1)**: Trading and financial interactions
- **Development (2)**: Software development and technical skills
- **Service (3)**: Service provision and customer satisfaction

## Smart Contract Functions

### Public Functions

- `stake-reputation`: Stake STX to back reputation
- `submit-rating`: Rate another user with stake
- `verify-rating`: Verify rating (validators only)
- `challenge-rating`: Challenge disputed rating
- `withdraw-stake`: Withdraw staked reputation tokens

### Read-only Functions

- `get-reputation`: Get user's reputation in category
- `calculate-reputation-score`: Get current reputation with decay
- `get-overall-reputation`: Get average across all categories
- `get-rating`: Get specific rating details
- `is-reputation-validator`: Check validator status

## Reputation Mechanics

### Scoring Algorithm
1. **Base Score**: Average of all ratings received
2. **Stake Weighting**: Higher stakes increase rating impact
3. **Time Decay**: Older ratings have reduced influence
4. **Verification Bonus**: Verified ratings carry more weight

### Staking Requirements
- **Minimum Stake**: 5 STX per rating
- **Validator Stake**: Higher stakes for verification rights
- **Challenge Stakes**: 2x original stake to challenge rating

## SDK Usage

```typescript
import { ReputationSystemSDK } from './src/stacks-sdk';

// Initialize SDK
const sdk = new ReputationSystemSDK(true); // true for mainnet

// Stake reputation tokens
await sdk.stakeReputation(senderKey, 1, 10000000); // 10 STX for trading category

// Submit rating
await sdk.submitRating(
  senderKey,
  'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9', // ratee
  1, // trading category
  85, // score out of 100
  'Excellent trading partner, fast and reliable',
  5000000 // 5 STX stake
);

// Get reputation
const reputation = await sdk.getReputation(userAddress, 1);
const overallRep = await sdk.getOverallReputation(userAddress);
```

## Use Cases

- **Marketplace Trust**: Build trust in decentralized marketplaces
- **Service Providers**: Rate freelancers and service providers
- **Trading Partners**: Assess trading counterparty risk
- **Community Governance**: Reputation-based voting weights
- **Professional Networks**: Skill and expertise validation

## Validator Network

Validators are trusted entities that can verify ratings:
- **Verification Rights**: Can mark ratings as verified
- **Higher Stakes**: Must maintain higher stake amounts
- **Dispute Resolution**: Participate in challenge resolution
- **Reputation Requirements**: Must have high reputation scores

## Anti-Gaming Measures

- **Stake Requirements**: Economic cost to submit ratings
- **Challenge System**: Community can dispute fake ratings
- **Time Decay**: Prevents old rating manipulation
- **Verification Layer**: Trusted validators filter quality
- **Self-Rating Prevention**: Cannot rate yourself

## Deployment

### Testnet
```bash
npm run deploy:testnet
```

### Mainnet
```bash
npm run deploy:mainnet
```

## Testing

```bash
npm test
npm run test:coverage
```

## License

MIT License - Built for decentralized trust networks
