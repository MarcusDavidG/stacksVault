import { StacksNetwork } from '@stacks/network';

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  blockHeight?: number;
  blockHash?: string;
  gasUsed?: number;
  fee?: number;
}

export interface AccountBalance {
  address: string;
  balance: number;
  locked: number;
  nonce: number;
}

export interface ContractInfo {
  contractId: string;
  sourceCode: string;
  abi: any;
  status: string;
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
        txId: data.tx_id,
        status: data.tx_status === 'success' ? 'success' : 
                data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' ? 'failed' : 'pending',
        blockHeight: data.block_height,
        blockHash: data.block_hash,
        gasUsed: data.fee_rate,
        fee: data.fee_rate,
      };
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  async getAccountBalance(address: string): Promise<AccountBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/address/${address}/balances`);
      const data = await response.json();

      return {
        address,
        balance: parseInt(data.stx.balance),
        locked: parseInt(data.stx.locked),
        nonce: data.nonce,
      };
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error}`);
    }
  }

  async getContractInfo(contractAddress: string, contractName: string): Promise<ContractInfo> {
    try {
      const contractId = `${contractAddress}.${contractName}`;
      const response = await fetch(`${this.baseUrl}/extended/v1/contract/${contractId}`);
      const data = await response.json();

      return {
        contractId,
        sourceCode: data.source_code,
        abi: data.abi,
        status: data.status,
      };
    } catch (error) {
      throw new Error(`Failed to get contract info: ${error}`);
    }
  }

  async getContractEvents(contractAddress: string, contractName: string, limit: number = 50): Promise<any[]> {
    try {
      const contractId = `${contractAddress}.${contractName}`;
      const response = await fetch(
        `${this.baseUrl}/extended/v1/contract/${contractId}/events?limit=${limit}`
      );
      const data = await response.json();

      return data.results || [];
    } catch (error) {
      throw new Error(`Failed to get contract events: ${error}`);
    }
  }

  async monitorTransaction(txId: string, maxAttempts: number = 30): Promise<TransactionStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getTransactionStatus(txId);
      
      if (status.status !== 'pending') {
        return status;
      }

      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error(`Transaction ${txId} did not complete within expected time`);
  }

  async getNetworkInfo(): Promise<{
    chainId: number;
    networkId: number;
    blockHeight: number;
    burnBlockHeight: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/info`);
      const data = await response.json();

      return {
        chainId: data.network_id,
        networkId: data.network_id,
        blockHeight: data.stacks_tip_height,
        burnBlockHeight: data.burn_block_height,
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error}`);
    }
  }
}
