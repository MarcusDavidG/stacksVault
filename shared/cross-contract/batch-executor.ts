import { makeContractCall, broadcastTransaction } from '@stacks/transactions';
import { BatchTransaction } from './types';

export class BatchExecutor {
  async executeBatch(batch: BatchTransaction, network: any) {
    const results = [];
    for (const call of batch.calls) {
      const tx = await makeContractCall({
        ...call,
        network,
        senderKey: batch.sender
      });
      const result = await broadcastTransaction(tx, network);
      results.push(result);
    }
    return results;
  }
}
