import { ContractEvent } from './types';

export class EventBus {
  private listeners: Map<string, Function[]> = new Map();

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: ContractEvent) {
    const key = `${event.contract}:${event.event}`;
    const callbacks = this.listeners.get(key) || [];
    callbacks.forEach(cb => cb(event.data));
  }
}
