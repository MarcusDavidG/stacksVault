# Prediction Market

A decentralized prediction market platform for betting on future events with oracle-based resolution.

## Features

- **Decentralized Betting**: Place bets on binary outcome events
- **Oracle Resolution**: Trusted oracles resolve market outcomes
- **Dynamic Odds**: Real-time odds calculation based on betting volume
- **Multiple Categories**: Support for various prediction categories
- **Automatic Payouts**: Smart contract handles winner payouts

## Smart Contract Functions

### Public Functions

- `create-market`: Create new prediction market
- `place-bet`: Place bet on market outcome (yes/no)
- `resolve-market`: Resolve market outcome (oracle only)
- `claim-winnings`: Claim winnings after market resolution
- `close-market`: Close market early (creator only)

### Read-only Functions

- `get-market`: Get market details
- `get-user-bet`: Get user's bet on specific market
- `get-market-participants`: Get all market participants
- `calculate-payout`: Calculate potential payout for user
- `get-market-odds`: Get current market odds

## Market Lifecycle

1. **Creation**: Market creator sets title, description, end time, and oracle
2. **Betting Phase**: Users place bets until end time
3. **Resolution**: Oracle resolves market with true/false outcome
4. **Payout**: Winners claim their proportional share of the pool

## SDK Usage

```typescript
import { PredictionMarketSDK } from './src/stacks-sdk';

// Initialize SDK
const sdk = new PredictionMarketSDK(true); // true for mainnet

// Create market
const marketId = await sdk.createMarket(
  senderKey,
  'Will Bitcoin reach $100k by 2025?',
  'Prediction market for Bitcoin price',
  1000000, // end time
  1100000, // resolution time
  oracleAddress,
  'crypto'
);

// Place bet
await sdk.placeBet(senderKey, marketId, true, 1000000); // bet YES with 1 STX

// Resolve market (oracle only)
await sdk.resolveMarket(oracleKey, marketId, true);

// Claim winnings
await sdk.claimWinnings(senderKey, marketId);
```

## Oracle System

Markets require trusted oracles to resolve outcomes. Oracles are set during market creation and have exclusive rights to resolve their assigned markets.

## Fee Structure

- Platform fee: 3% of total betting pool
- Fees are automatically deducted from payouts
- Remaining pool distributed to winners proportionally

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

MIT License - Built for decentralized prediction markets
