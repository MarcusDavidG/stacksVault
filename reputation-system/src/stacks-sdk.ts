import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  makeContractSTXPostCondition,
  FungibleConditionCode
} from '@stacks/transactions';

export class ReputationSystemSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = true) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = isMainnet 
      ? 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'
      : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'reputation-system';
  }

  async stakeReputation(senderKey: string, category: number, amount: number) {
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
      functionName: 'stake-reputation',
      functionArgs: [
        uintCV(category),
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

  async submitRating(
    senderKey: string,
    ratee: string,
    category: number,
    score: number,
    comment: string,
    stake: number
  ) {
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        stake
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'submit-rating',
      functionArgs: [
        principalCV(ratee),
        uintCV(category),
        uintCV(score),
        stringAsciiCV(comment),
        uintCV(stake)
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

  async verifyRating(senderKey: string, ratingId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'verify-rating',
      functionArgs: [uintCV(ratingId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async challengeRating(senderKey: string, ratingId: number, challengeStake: number) {
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        challengeStake
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'challenge-rating',
      functionArgs: [
        uintCV(ratingId),
        uintCV(challengeStake)
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

  async withdrawStake(senderKey: string, category: number, amount: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'withdraw-stake',
      functionArgs: [
        uintCV(category),
        uintCV(amount)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  // Read-only functions
  async getReputation(user: string, category: number) {
    // Implementation for read-only call
    return { user, category, score: 0 }; // Placeholder
  }

  async calculateReputationScore(user: string, category: number) {
    // Implementation for read-only call
    return { score: 0 }; // Placeholder
  }

  async getOverallReputation(user: string) {
    // Implementation for read-only call
    return { overallScore: 0 }; // Placeholder
  }

  async getRating(ratingId: number) {
    // Implementation for read-only call
    return { ratingId, verified: false }; // Placeholder
  }
}
