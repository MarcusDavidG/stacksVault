export class Validator {
  isValidAddress(address: string): boolean {
    return /^S[A-Z0-9]{39}$/.test(address);
  }

  isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  isValidTxId(txId: string): boolean {
    return /^0x[a-f0-9]{64}$/.test(txId);
  }
}
