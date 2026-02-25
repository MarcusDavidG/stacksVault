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

export class AssetTokenizerSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = true) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = isMainnet 
      ? 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9'
      : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'asset-tokenizer';
  }

  async tokenizeAsset(
    senderKey: string,
    assetType: string,
    description: string,
    totalValue: number,
    tokenSupply: number,
    verificationDoc: string,
    metadataUri: string,
    location: string
  ) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'tokenize-asset',
      functionArgs: [
        stringAsciiCV(assetType),
        stringAsciiCV(description),
        uintCV(totalValue),
        uintCV(tokenSupply),
        stringAsciiCV(verificationDoc),
        stringAsciiCV(metadataUri),
        stringAsciiCV(location)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async verifyAsset(senderKey: string, assetId: number, verifiedValue: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'verify-asset',
      functionArgs: [
        uintCV(assetId),
        uintCV(verifiedValue)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async activateAsset(senderKey: string, assetId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'activate-asset',
      functionArgs: [uintCV(assetId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async transferTokens(
    senderKey: string,
    assetId: number,
    recipient: string,
    amount: number,
    pricePerToken: number
  ) {
    const totalPrice = amount * pricePerToken;
    const postConditions = [
      makeContractSTXPostCondition(
        this.contractAddress,
        this.contractName,
        FungibleConditionCode.Equal,
        totalPrice
      )
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'transfer-tokens',
      functionArgs: [
        uintCV(assetId),
        principalCV(recipient),
        uintCV(amount),
        uintCV(pricePerToken)
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

  async burnTokens(senderKey: string, assetId: number, amount: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'burn-tokens',
      functionArgs: [
        uintCV(assetId),
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

  async addAppraiser(senderKey: string, appraiser: string) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'add-appraiser',
      functionArgs: [principalCV(appraiser)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  // Read-only functions
  async getAsset(assetId: number) {
    // Implementation for read-only call
    return { assetId, status: 'active' }; // Placeholder
  }

  async getTokenBalance(assetId: number, holder: string) {
    // Implementation for read-only call
    return { balance: 0 }; // Placeholder
  }

  async calculateTokenValue(assetId: number, tokenAmount: number) {
    // Implementation for read-only call
    return { value: 0 }; // Placeholder
  }

  async getAssetValuation(assetId: number, appraiser: string) {
    // Implementation for read-only call
    return { valuation: 0, timestamp: 0 }; // Placeholder
  }
}
