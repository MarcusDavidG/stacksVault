export interface TransactionMetrics {
  txId: string;
  functionName: string;
  gasUsed: number;
  executionTime: number;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

export class PerformanceAnalytics {
  private static metrics: TransactionMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  static addTransaction(metrics: TransactionMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  static getPerformanceMetrics(): {
    totalTransactions: number;
    successRate: number;
    averageGasUsed: number;
    averageExecutionTime: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalTransactions: 0,
        successRate: 0,
        averageGasUsed: 0,
        averageExecutionTime: 0,
      };
    }

    const successfulTxs = this.metrics.filter(m => m.success);
    const totalGas = this.metrics.reduce((sum, m) => sum + m.gasUsed, 0);
    const totalTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0);

    return {
      totalTransactions: this.metrics.length,
      successRate: (successfulTxs.length / this.metrics.length) * 100,
      averageGasUsed: totalGas / this.metrics.length,
      averageExecutionTime: totalTime / this.metrics.length,
    };
  }

  static getHourlyMetrics(): Map<number, number> {
    const hourlyData = new Map<number, number>();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (let i = 0; i < 24; i++) {
      const hourStart = now - (i * oneHour);
      const hourEnd = hourStart + oneHour;
      
      const count = this.metrics.filter(m => 
        m.timestamp >= hourStart && m.timestamp < hourEnd
      ).length;
      
      hourlyData.set(i, count);
    }

    return hourlyData;
  }

  static getTopPerformingFunctions(): Array<{
    functionName: string;
    callCount: number;
    averageGasUsed: number;
    successRate: number;
  }> {
    const functionStats = new Map<string, {
      calls: number;
      totalGas: number;
      successes: number;
    }>();

    this.metrics.forEach(m => {
      if (!functionStats.has(m.functionName)) {
        functionStats.set(m.functionName, {
          calls: 0,
          totalGas: 0,
          successes: 0,
        });
      }

      const stats = functionStats.get(m.functionName)!;
      stats.calls++;
      stats.totalGas += m.gasUsed;
      if (m.success) stats.successes++;
    });

    return Array.from(functionStats.entries()).map(([name, stats]) => ({
      functionName: name,
      callCount: stats.calls,
      averageGasUsed: stats.totalGas / stats.calls,
      successRate: (stats.successes / stats.calls) * 100,
    })).sort((a, b) => b.callCount - a.callCount);
  }

  static exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  static clearMetrics(): void {
    this.metrics = [];
  }
}
