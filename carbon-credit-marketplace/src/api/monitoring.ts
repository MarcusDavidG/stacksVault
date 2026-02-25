import { StacksAPI } from './stacks-api';

export interface ContractHealth {
  contractId: string;
  isResponding: boolean;
  lastChecked: number;
  responseTime: number;
  errorCount: number;
}

export class ContractMonitoring {
  private stacksAPI: StacksAPI;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private healthStatus: Map<string, ContractHealth> = new Map();

  constructor(stacksAPI: StacksAPI) {
    this.stacksAPI = stacksAPI;
  }

  startTransactionMonitoring(
    contractAddress: string,
    contractName: string,
    callback: (events: any[]) => void,
    intervalMs: number = 30000
  ): void {
    const contractId = `${contractAddress}.${contractName}`;
    
    // Clear existing monitoring if any
    this.stopMonitoring(contractId);

    const interval = setInterval(async () => {
      try {
        const events = await this.stacksAPI.getContractEvents(contractAddress, contractName, 10);
        callback(events);
        
        // Update health status
        this.updateHealthStatus(contractId, true, 0);
      } catch (error) {
        console.error(`Monitoring error for ${contractId}:`, error);
        this.updateHealthStatus(contractId, false, 1);
      }
    }, intervalMs);

    this.monitoringIntervals.set(contractId, interval);
  }

  stopMonitoring(contractId: string): void {
    const interval = this.monitoringIntervals.get(contractId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(contractId);
    }
  }

  stopAllMonitoring(): void {
    this.monitoringIntervals.forEach((interval, contractId) => {
      clearInterval(interval);
    });
    this.monitoringIntervals.clear();
  }

  private updateHealthStatus(contractId: string, isResponding: boolean, errorIncrement: number): void {
    const existing = this.healthStatus.get(contractId) || {
      contractId,
      isResponding: true,
      lastChecked: 0,
      responseTime: 0,
      errorCount: 0,
    };

    this.healthStatus.set(contractId, {
      ...existing,
      isResponding,
      lastChecked: Date.now(),
      errorCount: existing.errorCount + errorIncrement,
    });
  }

  getContractHealth(contractId: string): ContractHealth | undefined {
    return this.healthStatus.get(contractId);
  }

  getAllHealthStatus(): ContractHealth[] {
    return Array.from(this.healthStatus.values());
  }

  async performHealthCheck(contractAddress: string, contractName: string): Promise<ContractHealth> {
    const contractId = `${contractAddress}.${contractName}`;
    const startTime = Date.now();

    try {
      await this.stacksAPI.getContractInfo(contractAddress, contractName);
      const responseTime = Date.now() - startTime;

      const health: ContractHealth = {
        contractId,
        isResponding: true,
        lastChecked: Date.now(),
        responseTime,
        errorCount: 0,
      };

      this.healthStatus.set(contractId, health);
      return health;
    } catch (error) {
      const health: ContractHealth = {
        contractId,
        isResponding: false,
        lastChecked: Date.now(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
      };

      this.healthStatus.set(contractId, health);
      return health;
    }
  }
}
