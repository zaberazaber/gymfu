import { pgPool } from '../config/database';

async function resetGymOccupancy() {
  try {
    console.log('🔄 Resetting gym occupancy to 0...');

    const result = await pgPool.query(`
      UPDATE gyms 
      SET current_occupancy = 0
      WHERE current_occupancy IS NULL OR current_occupancy > 0
    `);

    console.log(`✅ Reset occupancy for ${result.rowCount} gyms`);

    // Verify the update
    const verification = await pgPool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE current_occupancy = 0) as zero_occupancy,
        COUNT(*) FILTER (WHERE current_occupancy IS NULL) as null_occupancy
      FROM gyms
    `);

    const stats = verification.rows[0];
    console.log('\n📊 Gym Occupancy Stats:');
    console.log(`   Total gyms: ${stats.total}`);
    console.log(`   Gyms with 0 occupancy: ${stats.zero_occupancy}`);
    console.log(`   Gyms with NULL occupancy: ${stats.null_occupancy}`);

    if (parseInt(stats.null_occupancy) > 0) {
      console.log('\n⚠️  Warning: Some gyms still have NULL occupancy');
    } else {
      console.log('\n✅ All gyms have valid occupancy values');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting gym occupancy:', error);
    process.exit(1);
  }
}

resetGymOccupancy();
