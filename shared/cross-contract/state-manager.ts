export class StateManager {
  private state: Map<string, any> = new Map();

  set(key: string, value: any) {
    this.state.set(key, value);
  }

  get(key: string): any {
    return this.state.get(key);
  }

  delete(key: string) {
    this.state.delete(key);
  }

  clear() {
    this.state.clear();
  }
}
