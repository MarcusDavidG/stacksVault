export class SecurityValidator {
  static validateAddress(address: string): boolean {
    // Validate Stacks address format
    const stacksAddressRegex = /^S[TPMN][0-9A-Z]{38,40}$/;
    return stacksAddressRegex.test(address);
  }

  static validateAmount(amount: number): boolean {
    return amount > 0 && Number.isInteger(amount) && amount <= Number.MAX_SAFE_INTEGER;
  }

  static sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input.replace(/[<>\"'&]/g, '').trim();
  }

  static validateContractName(name: string): boolean {
    // Validate contract name format
    const contractNameRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
    return contractNameRegex.test(name) && name.length <= 128;
  }

  static validateFunctionArgs(args: any[]): boolean {
    // Validate function arguments
    return args.every(arg => {
      if (typeof arg === 'string') {
        return arg.length <= 256;
      }
      if (typeof arg === 'number') {
        return this.validateAmount(arg);
      }
      return true;
    });
  }

  static validateTransactionFee(fee: number): boolean {
    // Validate transaction fee is reasonable
    const minFee = 1000; // 0.001 STX
    const maxFee = 100000000; // 100 STX
    return fee >= minFee && fee <= maxFee;
  }
}
