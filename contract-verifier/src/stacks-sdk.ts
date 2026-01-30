import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV
} from '@stacks/transactions';

export class ContractverifierSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = false) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'contract-verifier';
  }

  async executeFunction(senderKey: string, functionName: string, args: any[]) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName,
      functionArgs: args,
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }
}

  // Enhanced features using helpers
  private helpers: StacksHelpers;

  initializeHelpers() {
    this.helpers = new StacksHelpers(this.network, this.contractAddress, this.contractName);
  }

  async getBalance(address: string): Promise<number> {
    if (!this.helpers) this.initializeHelpers();
    return await this.helpers.getContractBalance(address);
  }

  async waitForConfirmation(txId: string): Promise<boolean> {
    if (!this.helpers) this.initializeHelpers();
    return await this.helpers.waitForTransaction(txId);
  }

  formatAmount(microSTX: number): string {
    if (!this.helpers) this.initializeHelpers();
    return this.helpers.formatSTXAmount(microSTX);
  }
}
