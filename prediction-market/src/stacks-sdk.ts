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

export class PredictionMarketSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = true) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = isMainnet 
      ? 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'
      : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'prediction-market';
  }

  async createMarket(
    senderKey: string,
    title: string,
    description: string,
    endTime: number,
    resolutionTime: number,
    oracle: string,
    category: string
  ) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'create-market',
      functionArgs: [
        stringAsciiCV(title),
        stringAsciiCV(description),
        uintCV(endTime),
        uintCV(resolutionTime),
        principalCV(oracle),
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

  async placeBet(senderKey: string, marketId: number, betOnYes: boolean, amount: number) {
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        amount
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'place-bet',
      functionArgs: [
        uintCV(marketId),
        boolCV(betOnYes),
        uintCV(amount)
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

  async resolveMarket(senderKey: string, marketId: number, outcome: boolean) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'resolve-market',
      functionArgs: [
        uintCV(marketId),
        boolCV(outcome)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async claimWinnings(senderKey: string, marketId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'claim-winnings',
      functionArgs: [uintCV(marketId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async closeMarket(senderKey: string, marketId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'close-market',
      functionArgs: [uintCV(marketId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  // Read-only functions
  async getMarket(marketId: number) {
    // Implementation for read-only call
    return { marketId, status: 'open' }; // Placeholder
  }

  async getMarketOdds(marketId: number) {
    // Implementation for read-only call
    return { yesOdds: 5000, noOdds: 5000, totalPool: 0 }; // Placeholder
  }

  async calculatePayout(marketId: number, userAddress: string) {
    // Implementation for read-only call
    return { payout: 0 }; // Placeholder
  }
}
