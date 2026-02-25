export interface UserActivity {
  userAddress: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class UserAnalytics {
  private static activities: UserActivity[] = [];
  private static readonly MAX_ACTIVITIES = 5000;

  static recordUserActivity(activity: UserActivity): void {
    this.activities.push(activity);
    
    // Keep only the most recent activities
    if (this.activities.length > this.MAX_ACTIVITIES) {
      this.activities = this.activities.slice(-this.MAX_ACTIVITIES);
    }
  }

  static getContractUsage(): {
    totalUsers: number;
    totalActivities: number;
    mostActiveUsers: Array<{ address: string; activityCount: number }>;
  } {
    const userActivityCount = new Map<string, number>();
    
    this.activities.forEach(activity => {
      const count = userActivityCount.get(activity.userAddress) || 0;
      userActivityCount.set(activity.userAddress, count + 1);
    });

    const mostActiveUsers = Array.from(userActivityCount.entries())
      .map(([address, count]) => ({ address, activityCount: count }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    return {
      totalUsers: userActivityCount.size,
      totalActivities: this.activities.length,
      mostActiveUsers,
    };
  }

  static getTopUsers(limit: number = 10): Array<{
    address: string;
    activityCount: number;
    lastActivity: number;
  }> {
    const userStats = new Map<string, {
      count: number;
      lastActivity: number;
    }>();

    this.activities.forEach(activity => {
      if (!userStats.has(activity.userAddress)) {
        userStats.set(activity.userAddress, {
          count: 0,
          lastActivity: 0,
        });
      }

      const stats = userStats.get(activity.userAddress)!;
      stats.count++;
      stats.lastActivity = Math.max(stats.lastActivity, activity.timestamp);
    });

    return Array.from(userStats.entries())
      .map(([address, stats]) => ({
        address,
        activityCount: stats.count,
        lastActivity: stats.lastActivity,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit);
  }

  static getUserActivity(userAddress: string): UserActivity[] {
    return this.activities.filter(activity => 
      activity.userAddress === userAddress
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  static getActiveUserCount(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeWindow;
    const activeUsers = new Set<string>();

    this.activities.forEach(activity => {
      if (activity.timestamp >= cutoff) {
        activeUsers.add(activity.userAddress);
      }
    });

    return activeUsers.size;
  }

  static exportUserData(): string {
    return JSON.stringify(this.activities, null, 2);
  }
}
