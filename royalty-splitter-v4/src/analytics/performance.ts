export interface PerformanceMetrics {
  transactionCount: number;
  averageGasUsed: number;
  successRate: number;
  averageConfirmationTime: number;
  totalVolume: number;
}

export interface TransactionMetric {
  txId: string;
  timestamp: number;
  gasUsed: number;
  success: boolean;
  confirmationTime: number;
  value: number;
}

export class PerformanceAnalytics {
  private metrics: TransactionMetric[] = [];
  private readonly maxMetrics = 1000;

  addTransaction(metric: TransactionMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getPerformanceMetrics(timeframe?: number): PerformanceMetrics {
    let filteredMetrics = this.metrics;
    
    if (timeframe) {
      const cutoff = Date.now() - timeframe;
      filteredMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    }

    if (filteredMetrics.length === 0) {
      return {
        transactionCount: 0,
        averageGasUsed: 0,
        successRate: 0,
        averageConfirmationTime: 0,
        totalVolume: 0
      };
    }

    const successfulTxs = filteredMetrics.filter(m => m.success);
    const totalGas = filteredMetrics.reduce((sum, m) => sum + m.gasUsed, 0);
    const totalConfirmationTime = successfulTxs.reduce((sum, m) => sum + m.confirmationTime, 0);
    const totalVolume = filteredMetrics.reduce((sum, m) => sum + m.value, 0);

    return {
      transactionCount: filteredMetrics.length,
      averageGasUsed: totalGas / filteredMetrics.length,
      successRate: successfulTxs.length / filteredMetrics.length,
      averageConfirmationTime: successfulTxs.length > 0 ? totalConfirmationTime / successfulTxs.length : 0,
      totalVolume
    };
  }

  getHourlyMetrics(): { hour: number; count: number; volume: number }[] {
    const hourlyData = new Map<number, { count: number; volume: number }>();
    
    this.metrics.forEach(metric => {
      const hour = Math.floor(metric.timestamp / (1000 * 60 * 60));
      const existing = hourlyData.get(hour) || { count: 0, volume: 0 };
      hourlyData.set(hour, {
        count: existing.count + 1,
        volume: existing.volume + metric.value
      });
    });

    return Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      ...data
    }));
  }

  getTopPerformingFunctions(): { functionName: string; count: number; successRate: number }[] {
    // This would be implemented with actual function tracking
    return [];
  }

  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.getPerformanceMetrics(),
      hourlyData: this.getHourlyMetrics()
    }, null, 2);
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}
