# Carbon Credit Marketplace

A decentralized marketplace for trading verified carbon credits on the Stacks blockchain.

## Features

- **Verified Carbon Credit Issuance**: Only verified issuers can create carbon credits
- **Marketplace Trading**: Buy and sell carbon credits with automatic fee collection
- **Credit Retirement**: Remove credits from circulation for carbon offsetting
- **Multiple Standards**: Support for various verification standards (VCS, Gold Standard, etc.)
- **Metadata Support**: IPFS integration for detailed project information

## Smart Contract Functions

### Public Functions

- `issue-credit`: Create new carbon credit (verified issuers only)
- `purchase-credit`: Buy available carbon credit
- `retire-credit`: Permanently remove credit from circulation
- `add-verified-issuer`: Add new verified issuer (admin only)
- `remove-verified-issuer`: Remove verified issuer (admin only)

### Read-only Functions

- `get-credit`: Get carbon credit details
- `get-credit-owner`: Get current owner of credit
- `get-user-credits`: Get all credits owned by user
- `is-verified-issuer`: Check if address is verified issuer
- `get-marketplace-stats`: Get marketplace statistics

## SDK Usage

```typescript
import { CarbonCreditMarketplaceSDK } from './src/stacks-sdk';

// Initialize SDK
const sdk = new CarbonCreditMarketplaceSDK(true); // true for mainnet

// Issue carbon credit
const creditId = await sdk.issueCredit(
  senderKey,
  'PROJ-001',
  100, // CO2 tons
  'VCS',
  1000000, // expiry block
  50000000, // price per ton in microSTX
  'https://metadata.example.com/credit1'
);

// Purchase credit
await sdk.purchaseCredit(senderKey, creditId, totalPrice);

// Retire credit
await sdk.retireCredit(senderKey, creditId);
```

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

MIT License - Built for the Stacks ecosystem
