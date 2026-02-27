export class GasEstimator {
  estimate(calls: any[]): number {
    return calls.length * 5000;
  }

  optimize(calls: any[]): any[] {
    return calls.sort((a, b) => a.priority - b.priority);
  }
}
