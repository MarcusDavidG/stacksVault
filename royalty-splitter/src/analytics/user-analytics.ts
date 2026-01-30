export interface UserActivity {
  address: string;
  transactionCount: number;
  totalVolume: number;
  lastActivity: number;
  favoriteFunction: string;
}

export interface ContractUsage {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageTransactionsPerUser: number;
}

export class UserAnalytics {
  private userActivities: Map<string, UserActivity> = new Map();
  private readonly activityThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

  recordUserActivity(address: string, volume: number, functionName: string): void {
    const existing = this.userActivities.get(address);
    const now = Date.now();

    if (existing) {
      existing.transactionCount++;
      existing.totalVolume += volume;
      existing.lastActivity = now;
      existing.favoriteFunction = functionName; // Simplified - would track most used
    } else {
      this.userActivities.set(address, {
        address,
        transactionCount: 1,
        totalVolume: volume,
        lastActivity: now,
        favoriteFunction: functionName
      });
    }
  }

  getContractUsage(): ContractUsage {
    const now = Date.now();
    const users = Array.from(this.userActivities.values());
    const activeUsers = users.filter(u => now - u.lastActivity < this.activityThreshold);
    const newUsers = users.filter(u => u.transactionCount === 1);
    const returningUsers = users.filter(u => u.transactionCount > 1);

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      newUsers: newUsers.length,
      returningUsers: returningUsers.length,
      averageTransactionsPerUser: users.length > 0 ? 
        users.reduce((sum, u) => sum + u.transactionCount, 0) / users.length : 0
    };
  }

  getTopUsers(limit: number = 10): UserActivity[] {
    return Array.from(this.userActivities.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }

  getUserActivity(address: string): UserActivity | null {
    return this.userActivities.get(address) || null;
  }

  getActiveUserCount(timeframe: number): number {
    const cutoff = Date.now() - timeframe;
    return Array.from(this.userActivities.values())
      .filter(u => u.lastActivity > cutoff).length;
  }

  exportUserData(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      usage: this.getContractUsage(),
      topUsers: this.getTopUsers(),
      totalActivities: this.userActivities.size
    }, null, 2);
  }
}
