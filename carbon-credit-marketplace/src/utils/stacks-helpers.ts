import { StacksNetwork } from '@stacks/network';
import { StacksAPI } from '../api/stacks-api';

export class StacksHelpers {
  private stacksAPI: StacksAPI;

  constructor(network: StacksNetwork) {
    this.stacksAPI = new StacksAPI(network);
  }

  async getContractBalance(contractAddress: string): Promise<number> {
    try {
      const balance = await this.stacksAPI.getAccountBalance(contractAddress);
      return balance.balance;
    } catch (error) {
      throw new Error(`Failed to get contract balance: ${error}`);
    }
  }

  async getContractInfo(contractAddress: string, contractName: string) {
    return await this.stacksAPI.getContractInfo(contractAddress, contractName);
  }

  async validateTransaction(txId: string): Promise<boolean> {
    try {
      const status = await this.stacksAPI.getTransactionStatus(txId);
      return status.status === 'success';
    } catch (error) {
      return false;
    }
  }

  formatSTXAmount(microSTX: number): string {
    const stx = microSTX / 1000000;
    return `${stx.toFixed(6)} STX`;
  }

  parseSTXAmount(stxString: string): number {
    const stx = parseFloat(stxString.replace(' STX', ''));
    return Math.floor(stx * 1000000);
  }

  async waitForTransaction(txId: string, maxWaitTime: number = 300000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.stacksAPI.getTransactionStatus(txId);
        
        if (status.status === 'success') {
          return true;
        } else if (status.status === 'failed') {
          return false;
        }
        
        // Wait 10 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        // Continue waiting if there's an API error
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    throw new Error(`Transaction ${txId} did not complete within ${maxWaitTime}ms`);
  }

  generateContractAddress(deployerAddress: string, contractName: string): string {
    return `${deployerAddress}.${contractName}`;
  }

  validateContractAddress(contractAddress: string): boolean {
    const parts = contractAddress.split('.');
    return parts.length === 2 && 
           parts[0].match(/^S[TPMN][0-9A-Z]{38,40}$/) !== null &&
           parts[1].match(/^[a-z][a-z0-9-]*[a-z0-9]$/) !== null;
  }

  async estimateTransactionFee(contractAddress: string, functionName: string): Promise<number> {
    // Simple fee estimation - in production, this would use actual fee estimation
    const baseFee = 1000; // 0.001 STX
    const complexityMultiplier = functionName.includes('transfer') ? 2 : 1;
    return baseFee * complexityMultiplier;
  }

  convertBlocksToTime(blocks: number, averageBlockTime: number = 600): number {
    // Convert blocks to milliseconds (default 10 minutes per block)
    return blocks * averageBlockTime * 1000;
  }

  convertTimeToBlocks(milliseconds: number, averageBlockTime: number = 600): number {
    // Convert milliseconds to blocks
    return Math.ceil(milliseconds / (averageBlockTime * 1000));
  }
}
