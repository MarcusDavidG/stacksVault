export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
}

export class AccessControl {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  
  addRole(role: Role): void {
    this.roles.set(role.name, role);
  }
  
  assignRole(userAddress: string, roleName: string): boolean {
    if (!this.roles.has(roleName)) {
      return false;
    }
    
    const userRoles = this.userRoles.get(userAddress) || [];
    if (!userRoles.includes(roleName)) {
      userRoles.push(roleName);
      this.userRoles.set(userAddress, userRoles);
    }
    
    return true;
  }
  
  revokeRole(userAddress: string, roleName: string): boolean {
    const userRoles = this.userRoles.get(userAddress);
    if (!userRoles) return false;
    
    const index = userRoles.indexOf(roleName);
    if (index > -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userAddress, userRoles);
      return true;
    }
    
    return false;
  }
  
  hasPermission(userAddress: string, action: string, resource: string): boolean {
    const userRoles = this.userRoles.get(userAddress) || [];
    
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (!role) continue;
      
      for (const permission of role.permissions) {
        if (permission.action === action && permission.resource === resource) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  getUserRoles(userAddress: string): string[] {
    return this.userRoles.get(userAddress) || [];
  }
  
  getRolePermissions(roleName: string): Permission[] {
    const role = this.roles.get(roleName);
    return role ? role.permissions : [];
  }
}
