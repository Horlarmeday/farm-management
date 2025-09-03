import { DataSource } from 'typeorm';
import { Role } from '@/entities/Role';
import { Permission } from '@/entities/Permission';
import { User } from '@/entities/User';
import { UserStatus } from '@kuyash/shared';
import * as bcrypt from 'bcryptjs';

export const seedRolesAndPermissions = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const userRepository = dataSource.getRepository(User);

  // Create permissions
  const permissions = [
    // User management
    { name: 'users:create', description: 'Create users', module: 'user', action: 'create' },
    { name: 'users:read', description: 'Read users', module: 'user', action: 'read' },
    { name: 'users:update', description: 'Update users', module: 'user', action: 'update' },
    { name: 'users:delete', description: 'Delete users', module: 'user', action: 'delete' },
    { name: 'users:manage', description: 'Manage all users', module: 'user', action: 'manage' },

    // Role management
    { name: 'roles:create', description: 'Create roles', module: 'role', action: 'create' },
    { name: 'roles:read', description: 'Read roles', module: 'role', action: 'read' },
    { name: 'roles:update', description: 'Update roles', module: 'role', action: 'update' },
    { name: 'roles:delete', description: 'Delete roles', module: 'role', action: 'delete' },
    { name: 'roles:manage', description: 'Manage all roles', module: 'role', action: 'manage' },

    // Poultry management
    {
      name: 'poultry:create',
      description: 'Create poultry records',
      module: 'poultry',
      action: 'create',
    },
    {
      name: 'poultry:read',
      description: 'Read poultry records',
      module: 'poultry',
      action: 'read',
    },
    {
      name: 'poultry:update',
      description: 'Update poultry records',
      module: 'poultry',
      action: 'update',
    },
    {
      name: 'poultry:delete',
      description: 'Delete poultry records',
      module: 'poultry',
      action: 'delete',
    },
    {
      name: 'poultry:manage',
      description: 'Manage all poultry',
      module: 'poultry',
      action: 'manage',
    },

    // Livestock management
    {
      name: 'livestock:create',
      description: 'Create livestock records',
      module: 'livestock',
      action: 'create',
    },
    {
      name: 'livestock:read',
      description: 'Read livestock records',
      module: 'livestock',
      action: 'read',
    },
    {
      name: 'livestock:update',
      description: 'Update livestock records',
      module: 'livestock',
      action: 'update',
    },
    {
      name: 'livestock:delete',
      description: 'Delete livestock records',
      module: 'livestock',
      action: 'delete',
    },
    {
      name: 'livestock:manage',
      description: 'Manage all livestock',
      module: 'livestock',
      action: 'manage',
    },

    // Fishery management
    {
      name: 'fishery:create',
      description: 'Create fishery records',
      module: 'fishery',
      action: 'create',
    },
    {
      name: 'fishery:read',
      description: 'Read fishery records',
      module: 'fishery',
      action: 'read',
    },
    {
      name: 'fishery:update',
      description: 'Update fishery records',
      module: 'fishery',
      action: 'update',
    },
    {
      name: 'fishery:delete',
      description: 'Delete fishery records',
      module: 'fishery',
      action: 'delete',
    },
    {
      name: 'fishery:manage',
      description: 'Manage all fishery',
      module: 'fishery',
      action: 'manage',
    },

    // Inventory management
    {
      name: 'inventory:create',
      description: 'Create inventory records',
      module: 'inventory',
      action: 'create',
    },
    {
      name: 'inventory:read',
      description: 'Read inventory records',
      module: 'inventory',
      action: 'read',
    },
    {
      name: 'inventory:update',
      description: 'Update inventory records',
      module: 'inventory',
      action: 'update',
    },
    {
      name: 'inventory:delete',
      description: 'Delete inventory records',
      module: 'inventory',
      action: 'delete',
    },
    {
      name: 'inventory:manage',
      description: 'Manage all inventory',
      module: 'inventory',
      action: 'manage',
    },

    // Finance management
    {
      name: 'finance:create',
      description: 'Create finance records',
      module: 'finance',
      action: 'create',
    },
    {
      name: 'finance:read',
      description: 'Read finance records',
      module: 'finance',
      action: 'read',
    },
    {
      name: 'finance:update',
      description: 'Update finance records',
      module: 'finance',
      action: 'update',
    },
    {
      name: 'finance:delete',
      description: 'Delete finance records',
      module: 'finance',
      action: 'delete',
    },
    {
      name: 'finance:manage',
      description: 'Manage all finance',
      module: 'finance',
      action: 'manage',
    },

    // Asset management
    {
      name: 'assets:create',
      description: 'Create asset records',
      module: 'assets',
      action: 'create',
    },
    { name: 'assets:read', description: 'Read asset records', module: 'assets', action: 'read' },
    {
      name: 'assets:update',
      description: 'Update asset records',
      module: 'assets',
      action: 'update',
    },
    {
      name: 'assets:delete',
      description: 'Delete asset records',
      module: 'assets',
      action: 'delete',
    },
    { name: 'assets:manage', description: 'Manage all assets', module: 'assets', action: 'manage' },

    // HR management
    { name: 'hr:create', description: 'Create HR records', module: 'hr', action: 'create' },
    { name: 'hr:read', description: 'Read HR records', module: 'hr', action: 'read' },
    { name: 'hr:update', description: 'Update HR records', module: 'hr', action: 'update' },
    { name: 'hr:delete', description: 'Delete HR records', module: 'hr', action: 'delete' },
    { name: 'hr:manage', description: 'Manage all HR', module: 'hr', action: 'manage' },

    // Reports
    { name: 'reports:view', description: 'View reports', module: 'reports', action: 'read' },
    { name: 'reports:create', description: 'Create reports', module: 'reports', action: 'create' },
    { name: 'reports:export', description: 'Export reports', module: 'reports', action: 'export' },
    {
      name: 'reports:manage',
      description: 'Manage all reports',
      module: 'reports',
      action: 'manage',
    },

    // Dashboard
    { name: 'dashboard:view', description: 'View dashboard', module: 'dashboard', action: 'read' },
    {
      name: 'dashboard:manage',
      description: 'Manage dashboard',
      module: 'dashboard',
      action: 'manage',
    },

    // Settings
    { name: 'settings:read', description: 'Read settings', module: 'settings', action: 'read' },
    {
      name: 'settings:update',
      description: 'Update settings',
      module: 'settings',
      action: 'update',
    },
    {
      name: 'settings:manage',
      description: 'Manage all settings',
      module: 'settings',
      action: 'manage',
    },

    // Notifications
    {
      name: 'notifications:read',
      description: 'Read notifications',
      module: 'notifications',
      action: 'read',
    },
    {
      name: 'notifications:create',
      description: 'Create notifications',
      module: 'notifications',
      action: 'create',
    },
    {
      name: 'notifications:update',
      description: 'Update notifications',
      module: 'notifications',
      action: 'update',
    },
    {
      name: 'notifications:delete',
      description: 'Delete notifications',
      module: 'notifications',
      action: 'delete',
    },
    {
      name: 'notifications:manage',
      description: 'Manage all notifications',
      module: 'notifications',
      action: 'manage',
    },
  ];

  // Create permissions
  const createdPermissions = await Promise.all(
    permissions.map(async (permissionData) => {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (existingPermission) {
        return existingPermission;
      }

      const permission = permissionRepository.create(permissionData);
      return await permissionRepository.save(permission);
    }),
  );

  // Create roles
  const rolesData = [
    {
      name: 'admin',
      description: 'Administrator with full access',
      isSystemRole: true,
      permissions: createdPermissions, // Admin gets all permissions
    },
    {
      name: 'manager',
      description: 'Manager with limited administrative access',
      isSystemRole: true,
      permissions: createdPermissions.filter(
        (p) =>
          !p.name.includes('users:manage') &&
          !p.name.includes('roles:manage') &&
          !p.name.includes('settings:manage'),
      ),
    },
    {
      name: 'supervisor',
      description: 'Supervisor with departmental access',
      isSystemRole: true,
      permissions: createdPermissions.filter(
        (p) =>
          p.name.includes(':read') ||
          p.name.includes(':create') ||
          p.name.includes(':update') ||
          p.name.includes('dashboard:view') ||
          p.name.includes('reports:view'),
      ),
    },
    {
      name: 'worker',
      description: 'Worker with basic access',
      isSystemRole: true,
      permissions: createdPermissions.filter(
        (p) =>
          p.name.includes(':read') ||
          p.name.includes('dashboard:view') ||
          p.name.includes('notifications:read'),
      ),
    },
  ];

  // Create roles
  const createdRoles = await Promise.all(
    rolesData.map(async (roleData) => {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      if (existingRole) {
        // Update permissions if role exists
        existingRole.permissions = roleData.permissions;
        return await roleRepository.save(existingRole);
      }

      const role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
        isSystemRole: roleData.isSystemRole,
        permissions: roleData.permissions,
      });
      return await roleRepository.save(role);
    }),
  );

  // Create default admin user
  const adminRole = createdRoles.find((role) => role.name === 'admin');
  if (adminRole) {
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@kuyashfarms.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const adminUser = userRepository.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@kuyashfarms.com',
        password: hashedPassword,
        employeeId: 'EMP001',
        department: 'Administration',
        status: UserStatus.ACTIVE,
        isActive: true,
        isEmailVerified: true,
        roleId: adminRole.id,
      });

      await userRepository.save(adminUser);
      console.log('✅ Default admin user created: admin@kuyashfarms.com / admin123');
    }
  }

  console.log('✅ Roles and permissions seeded successfully');
};
