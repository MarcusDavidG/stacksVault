import { StacksNetwork } from '@stacks/network';
import { 
  callReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV
} from '@stacks/transactions';

export class StacksHelpers {
  private network: StacksNetwork;
  private contractAddress: string;
  private contractName: string;

  constructor(network: StacksNetwork, contractAddress: string, contractName: string) {
    this.network = network;
    this.contractAddress = contractAddress;
    this.contractName = contractName;
  }

  async getContractBalance(address: string): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        network: this.network,
        senderAddress: address,
      });
      
      return parseInt(cvToJSON(result).value);
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async getContractInfo(): Promise<any> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-contract-info',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress,
      });
      
      return cvToJSON(result);
    } catch (error) {
      console.error('Error getting contract info:', error);
      return null;
    }
  }

  async validateTransaction(txId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.network.coreApiUrl}/extended/v1/tx/${txId}`);
      const txData = await response.json();
      return txData.tx_status === 'success';
    } catch (error) {
      console.error('Error validating transaction:', error);
      return false;
    }
  }

  formatSTXAmount(microSTX: number): string {
    return (microSTX / 1000000).toFixed(6) + ' STX';
  }

  async waitForTransaction(txId: string, maxAttempts: number = 30): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const isValid = await this.validateTransaction(txId);
      if (isValid) return true;
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
    return false;
  }
}
