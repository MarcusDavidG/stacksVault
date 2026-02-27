export class TransactionQueue {
  private queue: any[] = [];

  add(tx: any) {
    this.queue.push(tx);
  }

  process() {
    const batch = [...this.queue];
    this.queue = [];
    return batch;
  }

  size() {
    return this.queue.length;
  }
}
