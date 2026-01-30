import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
  boolCV,
  listCV,
  tupleCV,
  contractPrincipalCV
} from '@stacks/transactions';

export class RoyaltysplitterSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = false) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'royalty-splitter';
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

  async readOnlyFunction(functionName: string, args: any[]) {
    return { success: true, result: 'read-only-result' };
  }

  async batchExecute(senderKey: string, operations: Array<{functionName: string, args: any[]}>) {
    const results = [];
    for (const op of operations) {
      const result = await this.executeFunction(senderKey, op.functionName, op.args);
      results.push(result);
    }
    return results;
  }

  async getContractInfo() {
    return {
      address: this.contractAddress,
      name: this.contractName,
      network: this.network.isMainnet() ? 'mainnet' : 'testnet'
    };
  }
}
