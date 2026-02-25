import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  boolCV,
  makeContractSTXPostCondition,
  FungibleConditionCode
} from '@stacks/transactions';

export class SubscriptionManagerSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = true) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = isMainnet 
      ? 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'
      : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'subscription-manager';
  }

  async createService(
    senderKey: string,
    name: string,
    description: string,
    pricePerPeriod: number,
    periodLength: number,
    maxSubscribers: number,
    category: string
  ) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'create-service',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(description),
        uintCV(pricePerPeriod),
        uintCV(periodLength),
        uintCV(maxSubscribers),
        stringAsciiCV(category)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async subscribe(senderKey: string, serviceId: number, autoRenew: boolean, subscriptionPrice: number) {
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        subscriptionPrice
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'subscribe',
      functionArgs: [
        uintCV(serviceId),
        boolCV(autoRenew)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async renewSubscription(senderKey: string, serviceId: number, renewalPrice: number) {
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        renewalPrice
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'renew-subscription',
      functionArgs: [uintCV(serviceId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditions,
      postConditionMode: PostConditionMode.Deny,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async cancelSubscription(senderKey: string, serviceId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'cancel-subscription',
      functionArgs: [uintCV(serviceId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async pauseSubscription(senderKey: string, serviceId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'pause-subscription',
      functionArgs: [uintCV(serviceId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async resumeSubscription(senderKey: string, serviceId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'resume-subscription',
      functionArgs: [uintCV(serviceId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  // Read-only functions
  async getService(serviceId: number) {
    // Implementation for read-only call
    return { serviceId, status: 'active' }; // Placeholder
  }

  async getSubscription(serviceId: number, subscriber: string) {
    // Implementation for read-only call
    return { serviceId, subscriber, status: 'active' }; // Placeholder
  }

  async isSubscriptionActive(serviceId: number, subscriber: string) {
    // Implementation for read-only call
    return { active: true }; // Placeholder
  }
}
