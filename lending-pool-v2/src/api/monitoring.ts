import { StacksAPI, TransactionStatus } from './stacks-api';
import { StacksNetwork } from '@stacks/network';

export interface MonitoringConfig {
  pollInterval: number;
  maxRetries: number;
  alertThreshold: number;
}

export class ContractMonitoring {
  private api: StacksAPI;
  private config: MonitoringConfig;
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();

  constructor(network: StacksNetwork, config: MonitoringConfig) {
    this.api = new StacksAPI(network);
    this.config = config;
  }

  startTransactionMonitoring(txId: string, callback: (status: TransactionStatus) => void): void {
    const monitor = setInterval(async () => {
      const status = await this.api.getTransactionStatus(txId);
      callback(status);
      
      if (status.status === 'success' || status.status === 'failed') {
        this.stopMonitoring(txId);
      }
    }, this.config.pollInterval);

    this.activeMonitors.set(txId, monitor);
  }

  stopMonitoring(txId: string): void {
    const monitor = this.activeMonitors.get(txId);
    if (monitor) {
      clearInterval(monitor);
      this.activeMonitors.delete(txId);
    }
  }

  async getContractHealth(contractAddress: string, contractName: string): Promise<{
    isHealthy: boolean;
    lastActivity: number;
    eventCount: number;
  }> {
    try {
      const events = await this.api.getContractEvents(contractAddress, contractName, 10);
      const lastActivity = events.length > 0 ? events[0].block_time : 0;
      
      return {
        isHealthy: events.length > 0,
        lastActivity,
        eventCount: events.length
      };
    } catch (error) {
      return {
        isHealthy: false,
        lastActivity: 0,
        eventCount: 0
      };
    }
  }

  stopAllMonitoring(): void {
    this.activeMonitors.forEach((monitor, txId) => {
      clearInterval(monitor);
    });
    this.activeMonitors.clear();
  }
}
