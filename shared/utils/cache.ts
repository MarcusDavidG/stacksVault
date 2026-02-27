export class Cache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  set(key: string, value: any, ttl = 60000) {
    this.cache.set(key, { value, expiry: Date.now() + ttl });
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}
