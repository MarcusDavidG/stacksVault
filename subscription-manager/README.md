# Subscription Manager

A decentralized subscription management platform for recurring payments on the Stacks blockchain.

## Features

- **Service Creation**: Providers can create subscription services with custom pricing
- **Flexible Billing**: Support for various billing periods and pricing models
- **Auto-Renewal**: Automatic subscription renewal with user consent
- **Pause/Resume**: Users can pause and resume subscriptions
- **Payment History**: Complete transaction history and analytics
- **Multi-Category**: Support for different service categories

## Smart Contract Functions

### Public Functions

- `create-service`: Create new subscription service
- `subscribe`: Subscribe to a service with auto-renewal option
- `renew-subscription`: Manually renew subscription
- `cancel-subscription`: Cancel active subscription
- `pause-subscription`: Temporarily pause subscription
- `resume-subscription`: Resume paused subscription

### Read-only Functions

- `get-service`: Get service details
- `get-subscription`: Get user's subscription status
- `get-user-services`: Get all services user is subscribed to
- `is-subscription-active`: Check if subscription is active
- `get-subscription-stats`: Get platform statistics

## Use Cases

- **SaaS Platforms**: Recurring billing for software services
- **Content Subscriptions**: Media and content platform billing
- **Service Providers**: Professional service recurring payments
- **Membership Sites**: Community and membership management

## SDK Usage

```typescript
import { SubscriptionManagerSDK } from './src/stacks-sdk';

// Initialize SDK
const sdk = new SubscriptionManagerSDK(true); // true for mainnet

// Create service
const serviceId = await sdk.createService(
  senderKey,
  'Premium Analytics',
  'Advanced analytics dashboard',
  5000000, // 5 STX per period
  4320, // 30 days in blocks
  1000, // max subscribers
  'analytics'
);

// Subscribe to service
await sdk.subscribe(senderKey, serviceId, true, 5000000); // auto-renew enabled

// Renew subscription
await sdk.renewSubscription(senderKey, serviceId, 5000000);

// Cancel subscription
await sdk.cancelSubscription(senderKey, serviceId);
```

## Billing Periods

- **Daily**: 144 blocks (~24 hours)
- **Weekly**: 1,008 blocks (~7 days)
- **Monthly**: 4,320 blocks (~30 days)
- **Yearly**: 52,560 blocks (~365 days)

## Fee Structure

- Platform fee: 2% of subscription payments
- Fees automatically distributed to platform
- Transparent fee calculation

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

MIT License - Built for decentralized subscription management
