export class ContractRegistry {
  private contracts: Map<string, string> = new Map();

  register(name: string, address: string) {
    this.contracts.set(name, address);
  }

  get(name: string): string | undefined {
    return this.contracts.get(name);
  }

  list(): string[] {
    return Array.from(this.contracts.keys());
  }
}
