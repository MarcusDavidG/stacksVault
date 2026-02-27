export class RetryHandler {
  async retry(fn: Function, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
