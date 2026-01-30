import { standardPrincipalCV, uintCV, stringAsciiCV } from '@stacks/transactions';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SecurityValidator {
  
  static validateAddress(address: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!address) {
      errors.push('Address is required');
    } else if (!address.match(/^S[TM][0-9A-Z]{38}$/)) {
      errors.push('Invalid Stacks address format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static validateAmount(amount: number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (amount < min) {
      errors.push(`Amount must be at least ${min}`);
    }
    
    if (amount > max) {
      errors.push(`Amount cannot exceed ${max}`);
    }
    
    if (amount % 1 !== 0) {
      warnings.push('Amount should be a whole number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static validateContractName(name: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!name) {
      errors.push('Contract name is required');
    } else if (name.length > 128) {
      errors.push('Contract name too long (max 128 characters)');
    } else if (!name.match(/^[a-zA-Z]([a-zA-Z0-9]|[-_])*$/)) {
      errors.push('Invalid contract name format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static validateFunctionArgs(args: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (args.length > 16) {
      errors.push('Too many function arguments (max 16)');
    }
    
    args.forEach((arg, index) => {
      if (arg === null || arg === undefined) {
        errors.push(`Argument at index ${index} is null or undefined`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }
  
  static validateTransactionFee(fee: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (fee < 1000) {
      warnings.push('Transaction fee is very low, may cause delays');
    }
    
    if (fee > 1000000) {
      warnings.push('Transaction fee is very high');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
