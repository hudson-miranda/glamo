/**
 * RBAC Permission System using Bitflags
 * 
 * Each permission is represented by a single bit in a BigInt (64-bit integer).
 * This allows for extremely fast permission checks using bitwise operations.
 * 
 * Maximum: 64 permissions (0-63)
 * Current: 68 permissions (we'll need to consolidate or use 2 BigInts)
 * 
 * For now, using 2 separate bitflag groups:
 * - primaryPermissions (bits 0-63): Core business permissions
 * - secondaryPermissions (bits 0-7): Advanced module permissions
 */

// ============================================================================
// PRIMARY PERMISSIONS (Core Business - Bits 0-63)
// ============================================================================

export const PERMISSIONS_PRIMARY = {
  // Client Management (0-4)
  CLIENTS_VIEW: 1n << 0n,
  CLIENTS_CREATE: 1n << 1n,
  CLIENTS_EDIT: 1n << 2n,
  CLIENTS_DELETE: 1n << 3n,
  CLIENTS_EXPORT: 1n << 4n,

  // Appointment Management (5-9)
  APPOINTMENTS_VIEW: 1n << 5n,
  APPOINTMENTS_CREATE: 1n << 6n,
  APPOINTMENTS_EDIT: 1n << 7n,
  APPOINTMENTS_DELETE: 1n << 8n,
  APPOINTMENTS_ASSIGN: 1n << 9n,

  // Service Management (10-17)
  SERVICES_VIEW: 1n << 10n,
  SERVICES_CREATE: 1n << 11n,
  SERVICES_UPDATE: 1n << 12n,
  SERVICES_DELETE: 1n << 13n,
  SERVICE_CATEGORIES_CREATE: 1n << 14n,
  SERVICE_CATEGORIES_UPDATE: 1n << 15n,
  SERVICE_CATEGORIES_DELETE: 1n << 16n,
  SERVICES_MANAGE_PRICING: 1n << 17n,

  // Package Management (18-21)
  PACKAGES_VIEW: 1n << 18n,
  PACKAGES_CREATE: 1n << 19n,
  PACKAGES_UPDATE: 1n << 20n,
  PACKAGES_DELETE: 1n << 21n,

  // Product Management (22-28)
  PRODUCTS_VIEW: 1n << 22n,
  PRODUCTS_CREATE: 1n << 23n,
  PRODUCTS_UPDATE: 1n << 24n,
  PRODUCTS_DELETE: 1n << 25n,
  PRODUCT_CATEGORIES_CREATE: 1n << 26n,
  PRODUCT_CATEGORIES_UPDATE: 1n << 27n,
  PRODUCT_CATEGORIES_DELETE: 1n << 28n,

  // Sales & Financial (29-35)
  SALES_VIEW: 1n << 29n,
  SALES_CREATE: 1n << 30n,
  SALES_UPDATE: 1n << 31n,
  SALES_DELETE: 1n << 32n,
  SALES_APPLY_DISCOUNT: 1n << 33n,
  FINANCIAL_VIEW: 1n << 34n,
  FINANCIAL_MANAGE: 1n << 35n,

  // Cash Register (36-41)
  CASH_REGISTER_OPEN: 1n << 36n,
  CASH_REGISTER_CLOSE: 1n << 37n,
  CASH_REGISTER_VIEW: 1n << 38n,
  CASH_REGISTER_ADJUST: 1n << 39n,
  CASH_REGISTER_MANAGE_OTHERS: 1n << 40n,
  CASH_REGISTER_VIEW_HISTORY: 1n << 41n,

  // Reports (42-43)
  REPORTS_VIEW: 1n << 42n,
  REPORTS_EXPORT: 1n << 43n,

  // Employee Management (44-48)
  EMPLOYEES_READ: 1n << 44n,
  EMPLOYEES_CREATE: 1n << 45n,
  EMPLOYEES_UPDATE: 1n << 46n,
  EMPLOYEES_DELETE: 1n << 47n,
  EMPLOYEES_MANAGE_ROLES: 1n << 48n,

  // Inventory Management (49-53)
  INVENTORY_VIEW: 1n << 49n,
  INVENTORY_CREATE: 1n << 50n,
  INVENTORY_UPDATE: 1n << 51n,
  INVENTORY_DELETE: 1n << 52n,
  INVENTORY_ADJUST: 1n << 53n,

  // Salon Settings (54-60)
  SALON_VIEW_SETTINGS: 1n << 54n,
  SALON_EDIT_SETTINGS: 1n << 55n,
  SALON_DELETE: 1n << 56n,
  SALON_MANAGE_HOURS: 1n << 57n,
  SALON_MANAGE_HOLIDAYS: 1n << 58n,
  SALON_MANAGE_INTEGRATIONS: 1n << 59n,
  SALON_INVITE_MEMBERS: 1n << 60n,

  // Notifications (61-62)
  NOTIFICATIONS_SEND: 1n << 61n,
  NOTIFICATIONS_MANAGE: 1n << 62n,

  // Vouchers (63)
  VOUCHERS_MANAGE: 1n << 63n,
} as const;

// ============================================================================
// SECONDARY PERMISSIONS (Advanced Modules - Bits 0-7)
// ============================================================================

export const PERMISSIONS_SECONDARY = {
  // Loyalty Program (0-1)
  LOYALTY_VIEW: 1n << 0n,
  LOYALTY_MANAGE: 1n << 1n,

  // Referral Program (2-3)
  REFERRAL_VIEW: 1n << 2n,
  REFERRAL_MANAGE: 1n << 3n,

  // Advanced Analytics (4-5)
  ANALYTICS_VIEW: 1n << 4n,
  ANALYTICS_MANAGE: 1n << 5n,

  // Photo Gallery (6-7)
  PHOTOS_VIEW: 1n << 6n,
  PHOTOS_MANAGE: 1n << 7n,

  // Anamnesis Forms (8-9)
  ANAMNESIS_VIEW: 1n << 8n,
  ANAMNESIS_MANAGE: 1n << 9n,

  // Advanced Scheduling (10-11)
  SCHEDULING_VIEW: 1n << 10n,
  SCHEDULING_MANAGE: 1n << 11n,
} as const;

// ============================================================================
// PERMISSION GROUPS (For easier role configuration)
// ============================================================================

export const PERMISSION_GROUPS = {
  // All primary permissions (bits 0-63, but we have 58 permissions, so 0-57)
  // We use (1n << 58n) - 1n to get all 58 bits set
  ALL_PRIMARY: (1n << 58n) - 1n, // 288230376151711743n
  
  // All secondary permissions (bits 0-11, we have 12 permissions)
  ALL_SECONDARY: (1n << 12n) - 1n, // 4095n

  // Client management group
  CLIENTS_ALL: 
    PERMISSIONS_PRIMARY.CLIENTS_VIEW |
    PERMISSIONS_PRIMARY.CLIENTS_CREATE |
    PERMISSIONS_PRIMARY.CLIENTS_EDIT |
    PERMISSIONS_PRIMARY.CLIENTS_DELETE |
    PERMISSIONS_PRIMARY.CLIENTS_EXPORT,

  // Appointments group
  APPOINTMENTS_ALL:
    PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW |
    PERMISSIONS_PRIMARY.APPOINTMENTS_CREATE |
    PERMISSIONS_PRIMARY.APPOINTMENTS_EDIT |
    PERMISSIONS_PRIMARY.APPOINTMENTS_DELETE |
    PERMISSIONS_PRIMARY.APPOINTMENTS_ASSIGN,

  // Services group
  SERVICES_ALL:
    PERMISSIONS_PRIMARY.SERVICES_VIEW |
    PERMISSIONS_PRIMARY.SERVICES_CREATE |
    PERMISSIONS_PRIMARY.SERVICES_UPDATE |
    PERMISSIONS_PRIMARY.SERVICES_DELETE |
    PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_CREATE |
    PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_UPDATE |
    PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_DELETE |
    PERMISSIONS_PRIMARY.SERVICES_MANAGE_PRICING,

  // Sales group
  SALES_ALL:
    PERMISSIONS_PRIMARY.SALES_VIEW |
    PERMISSIONS_PRIMARY.SALES_CREATE |
    PERMISSIONS_PRIMARY.SALES_UPDATE |
    PERMISSIONS_PRIMARY.SALES_DELETE |
    PERMISSIONS_PRIMARY.SALES_APPLY_DISCOUNT,

  // Advanced modules (all)
  ADVANCED_ALL: Object.values(PERMISSIONS_SECONDARY).reduce((acc, val) => acc | val, 0n),
} as const;

// ============================================================================
// LEGACY PERMISSION NAME MAPPING
// ============================================================================

/**
 * Maps old string-based permission names to new bitflags
 * Used during migration and for backwards compatibility
 */
export const LEGACY_PERMISSION_MAP: Record<string, { primary?: bigint; secondary?: bigint }> = {
  // Clients
  'can_view_clients': { primary: PERMISSIONS_PRIMARY.CLIENTS_VIEW },
  'can_create_clients': { primary: PERMISSIONS_PRIMARY.CLIENTS_CREATE },
  'can_edit_clients': { primary: PERMISSIONS_PRIMARY.CLIENTS_EDIT },
  'can_delete_clients': { primary: PERMISSIONS_PRIMARY.CLIENTS_DELETE },
  'can_export_clients': { primary: PERMISSIONS_PRIMARY.CLIENTS_EXPORT },

  // Appointments
  'can_view_appointments': { primary: PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW },
  'can_create_appointments': { primary: PERMISSIONS_PRIMARY.APPOINTMENTS_CREATE },
  'can_edit_appointments': { primary: PERMISSIONS_PRIMARY.APPOINTMENTS_EDIT },
  'can_delete_appointments': { primary: PERMISSIONS_PRIMARY.APPOINTMENTS_DELETE },
  'can_assign_appointments': { primary: PERMISSIONS_PRIMARY.APPOINTMENTS_ASSIGN },

  // Services
  'can_view_services': { primary: PERMISSIONS_PRIMARY.SERVICES_VIEW },
  'can_create_services': { primary: PERMISSIONS_PRIMARY.SERVICES_CREATE },
  'can_update_services': { primary: PERMISSIONS_PRIMARY.SERVICES_UPDATE },
  'can_delete_services': { primary: PERMISSIONS_PRIMARY.SERVICES_DELETE },
  'can_create_service_categories': { primary: PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_CREATE },
  'can_update_service_categories': { primary: PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_UPDATE },
  'can_delete_service_categories': { primary: PERMISSIONS_PRIMARY.SERVICE_CATEGORIES_DELETE },
  'can_manage_service_pricing': { primary: PERMISSIONS_PRIMARY.SERVICES_MANAGE_PRICING },

  // Packages
  'can_view_packages': { primary: PERMISSIONS_PRIMARY.PACKAGES_VIEW },
  'can_create_packages': { primary: PERMISSIONS_PRIMARY.PACKAGES_CREATE },
  'can_update_packages': { primary: PERMISSIONS_PRIMARY.PACKAGES_UPDATE },
  'can_delete_packages': { primary: PERMISSIONS_PRIMARY.PACKAGES_DELETE },

  // Products
  'can_view_products': { primary: PERMISSIONS_PRIMARY.PRODUCTS_VIEW },
  'can_create_products': { primary: PERMISSIONS_PRIMARY.PRODUCTS_CREATE },
  'can_update_products': { primary: PERMISSIONS_PRIMARY.PRODUCTS_UPDATE },
  'can_delete_products': { primary: PERMISSIONS_PRIMARY.PRODUCTS_DELETE },
  'can_create_product_categories': { primary: PERMISSIONS_PRIMARY.PRODUCT_CATEGORIES_CREATE },
  'can_update_product_categories': { primary: PERMISSIONS_PRIMARY.PRODUCT_CATEGORIES_UPDATE },
  'can_delete_product_categories': { primary: PERMISSIONS_PRIMARY.PRODUCT_CATEGORIES_DELETE },

  // Sales
  'can_view_sales': { primary: PERMISSIONS_PRIMARY.SALES_VIEW },
  'can_create_sales': { primary: PERMISSIONS_PRIMARY.SALES_CREATE },
  'can_update_sales': { primary: PERMISSIONS_PRIMARY.SALES_UPDATE },
  'can_delete_sales': { primary: PERMISSIONS_PRIMARY.SALES_DELETE },
  'can_apply_discounts': { primary: PERMISSIONS_PRIMARY.SALES_APPLY_DISCOUNT },
  'can_view_financial': { primary: PERMISSIONS_PRIMARY.FINANCIAL_VIEW },
  'can_manage_financial': { primary: PERMISSIONS_PRIMARY.FINANCIAL_MANAGE },

  // Cash Register
  'can_open_cash_register': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_OPEN },
  'can_close_cash_register': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_CLOSE },
  'can_view_cash_register': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_VIEW },
  'can_adjust_cash_register': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_ADJUST },
  'can_manage_others_cash_register': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_MANAGE_OTHERS },
  'can_view_cash_register_history': { primary: PERMISSIONS_PRIMARY.CASH_REGISTER_VIEW_HISTORY },

  // Reports
  'can_view_reports': { primary: PERMISSIONS_PRIMARY.REPORTS_VIEW },
  'can_export_reports': { primary: PERMISSIONS_PRIMARY.REPORTS_EXPORT },

  // Employees
  'employees:read': { primary: PERMISSIONS_PRIMARY.EMPLOYEES_READ },
  'employees:create': { primary: PERMISSIONS_PRIMARY.EMPLOYEES_CREATE },
  'employees:update': { primary: PERMISSIONS_PRIMARY.EMPLOYEES_UPDATE },
  'employees:delete': { primary: PERMISSIONS_PRIMARY.EMPLOYEES_DELETE },
  'employees:manage_roles': { primary: PERMISSIONS_PRIMARY.EMPLOYEES_MANAGE_ROLES },

  // Inventory
  'inventory:view': { primary: PERMISSIONS_PRIMARY.INVENTORY_VIEW },
  'inventory:create': { primary: PERMISSIONS_PRIMARY.INVENTORY_CREATE },
  'inventory:update': { primary: PERMISSIONS_PRIMARY.INVENTORY_UPDATE },
  'inventory:delete': { primary: PERMISSIONS_PRIMARY.INVENTORY_DELETE },
  'inventory:adjust': { primary: PERMISSIONS_PRIMARY.INVENTORY_ADJUST },

  // Salon
  'can_view_salon_settings': { primary: PERMISSIONS_PRIMARY.SALON_VIEW_SETTINGS },
  'can_edit_salon_settings': { primary: PERMISSIONS_PRIMARY.SALON_EDIT_SETTINGS },
  'can_delete_salon': { primary: PERMISSIONS_PRIMARY.SALON_DELETE },
  'can_manage_salon_hours': { primary: PERMISSIONS_PRIMARY.SALON_MANAGE_HOURS },
  'can_manage_holidays': { primary: PERMISSIONS_PRIMARY.SALON_MANAGE_HOLIDAYS },
  'can_manage_integrations': { primary: PERMISSIONS_PRIMARY.SALON_MANAGE_INTEGRATIONS },
  'can_invite_salon_members': { primary: PERMISSIONS_PRIMARY.SALON_INVITE_MEMBERS },

  // Notifications
  'can_send_notifications': { primary: PERMISSIONS_PRIMARY.NOTIFICATIONS_SEND },
  'can_manage_notification_settings': { primary: PERMISSIONS_PRIMARY.NOTIFICATIONS_MANAGE },

  // Vouchers
  'can_manage_vouchers': { primary: PERMISSIONS_PRIMARY.VOUCHERS_MANAGE },

  // Advanced Modules
  'loyalty:view': { secondary: PERMISSIONS_SECONDARY.LOYALTY_VIEW },
  'loyalty:manage': { secondary: PERMISSIONS_SECONDARY.LOYALTY_MANAGE },
  'referral:view': { secondary: PERMISSIONS_SECONDARY.REFERRAL_VIEW },
  'referral:manage': { secondary: PERMISSIONS_SECONDARY.REFERRAL_MANAGE },
  'analytics:view': { secondary: PERMISSIONS_SECONDARY.ANALYTICS_VIEW },
  'analytics:manage': { secondary: PERMISSIONS_SECONDARY.ANALYTICS_MANAGE },
  'photos:view': { secondary: PERMISSIONS_SECONDARY.PHOTOS_VIEW },
  'photos:manage': { secondary: PERMISSIONS_SECONDARY.PHOTOS_MANAGE },
  'anamnesis:view': { secondary: PERMISSIONS_SECONDARY.ANAMNESIS_VIEW },
  'anamnesis:manage': { secondary: PERMISSIONS_SECONDARY.ANAMNESIS_MANAGE },
  'scheduling:view': { secondary: PERMISSIONS_SECONDARY.SCHEDULING_VIEW },
  'scheduling:manage': { secondary: PERMISSIONS_SECONDARY.SCHEDULING_MANAGE },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a bitflag set has a specific permission
 */
export function hasPermission(
  primaryFlags: bigint,
  secondaryFlags: bigint,
  permission: { primary?: bigint; secondary?: bigint }
): boolean {
  const hasPrimary = permission.primary ? (primaryFlags & permission.primary) !== 0n : true;
  const hasSecondary = permission.secondary ? (secondaryFlags & permission.secondary) !== 0n : true;
  return hasPrimary && hasSecondary;
}

/**
 * Converts legacy permission name to bitflags
 */
export function legacyPermissionToBitflag(permissionName: string): { primary: bigint; secondary: bigint } {
  const mapped = LEGACY_PERMISSION_MAP[permissionName];
  return {
    primary: mapped?.primary || 0n,
    secondary: mapped?.secondary || 0n,
  };
}

/**
 * Adds a permission to existing bitflags
 */
export function addPermission(
  current: { primary: bigint; secondary: bigint },
  permission: { primary?: bigint; secondary?: bigint }
): { primary: bigint; secondary: bigint } {
  return {
    primary: current.primary | (permission.primary || 0n),
    secondary: current.secondary | (permission.secondary || 0n),
  };
}

/**
 * Removes a permission from existing bitflags
 */
export function removePermission(
  current: { primary: bigint; secondary: bigint },
  permission: { primary?: bigint; secondary?: bigint }
): { primary: bigint; secondary: bigint } {
  return {
    primary: current.primary & ~(permission.primary || 0n),
    secondary: current.secondary & ~(permission.secondary || 0n),
  };
}
