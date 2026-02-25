export class AccessControl {
  private static adminRoles: Map<string, Set<string>> = new Map();
  private static userRoles: Map<string, Set<string>> = new Map();

  static addRole(roleName: string, permissions: string[]): void {
    if (!this.adminRoles.has(roleName)) {
      this.adminRoles.set(roleName, new Set(permissions));
    }
  }

  static assignRole(userAddress: string, roleName: string): boolean {
    if (!this.adminRoles.has(roleName)) {
      return false;
    }

    if (!this.userRoles.has(userAddress)) {
      this.userRoles.set(userAddress, new Set());
    }

    this.userRoles.get(userAddress)!.add(roleName);
    return true;
  }

  static revokeRole(userAddress: string, roleName: string): boolean {
    const userRoleSet = this.userRoles.get(userAddress);
    if (!userRoleSet) {
      return false;
    }

    return userRoleSet.delete(roleName);
  }

  static hasPermission(userAddress: string, permission: string): boolean {
    const userRoleSet = this.userRoles.get(userAddress);
    if (!userRoleSet) {
      return false;
    }

    for (const role of userRoleSet) {
      const rolePermissions = this.adminRoles.get(role);
      if (rolePermissions && rolePermissions.has(permission)) {
        return true;
      }
    }

    return false;
  }

  static getUserRoles(userAddress: string): string[] {
    const userRoleSet = this.userRoles.get(userAddress);
    return userRoleSet ? Array.from(userRoleSet) : [];
  }

  static getRolePermissions(roleName: string): string[] {
    const permissions = this.adminRoles.get(roleName);
    return permissions ? Array.from(permissions) : [];
  }
}
