import { seedRbacPermissionsAndRoles } from '../../rbac/seed';

/**
 * Seeds the database with Glamo-specific data.
 * This includes RBAC permissions and roles.
 */
export async function seedGlamoData() {
  console.log('🌱 Starting Glamo seed...');
  
  try {
    // Seed RBAC permissions and roles
    await seedRbacPermissionsAndRoles();
    
    console.log('✅ Glamo seed completed successfully');
  } catch (error) {
    console.error('❌ Glamo seed failed:', error);
    throw error;
  }
}
