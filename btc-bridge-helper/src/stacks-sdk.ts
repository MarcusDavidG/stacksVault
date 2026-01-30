import { StacksNetwork, StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';

export class BtcBridgeHelperSDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = false) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'btc-bridge-helper';
  }

  async initiateBridge(senderKey: string, amount: number, btcAddress: string) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'initiate-bridge',
      functionArgs: [uintCV(amount), standardPrincipalCV(btcAddress)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async completeBridge(senderKey: string, bridgeId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'complete-bridge',
      functionArgs: [uintCV(bridgeId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }
}
