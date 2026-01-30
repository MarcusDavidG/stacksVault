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

export class BtcBridgeHelperV2SDK {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(isMainnet: boolean = false) {
    this.network = isMainnet ? new StacksMainnet() : new StacksTestnet();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.contractName = 'btc-bridge-helper-v2';
  }

  async initiateBridgeV2(senderKey: string, amount: number, btcAddress: string, metadata: string) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'initiate-bridge-v2',
      functionArgs: [
        uintCV(amount), 
        stringAsciiCV(btcAddress),
        stringAsciiCV(metadata)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async validateBridgeRequest(senderKey: string, bridgeId: number) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'validate-bridge-request',
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
