import { StacksNetwork } from '@stacks/network';

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  blockHeight?: number;
  timestamp?: number;
}

export interface ContractCallResult {
  success: boolean;
  result?: any;
  error?: string;
}

export class StacksAPI {
  private network: StacksNetwork;
  private baseUrl: string;

  constructor(network: StacksNetwork) {
    this.network = network;
    this.baseUrl = network.coreApiUrl;
  }

  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/tx/${txId}`);
      const data = await response.json();
      
      return {
        txId,
        status: data.tx_status === 'success' ? 'success' : 
                data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' ? 'failed' : 'pending',
        blockHeight: data.block_height,
        timestamp: data.burn_block_time
      };
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return { txId, status: 'failed', error: error.message };
    }
  }

  async getContractInfo(contractAddress: string, contractName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/contract/${contractAddress}.${contractName}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return null;
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/address/${address}/balances`);
      const data = await response.json();
      return parseInt(data.stx.balance);
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }

  async getContractEvents(contractAddress: string, contractName: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=${limit}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching contract events:', error);
      return [];
    }
  }

  async monitorTransaction(txId: string, maxAttempts: number = 30): Promise<TransactionStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTransactionStatus(txId);
      
      if (status.status === 'success' || status.status === 'failed') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    }
    
    return { txId, status: 'pending' };
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/info`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching network info:', error);
      return null;
    }
  }
}
