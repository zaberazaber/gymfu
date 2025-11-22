import { pgPool } from '../config/database';

async function addImagesColumn() {
  try {
    console.log('Adding images column to gyms table...');

    const query = `
      ALTER TABLE gyms 
      ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
    `;

    await pgPool.query(query);
    console.log('✅ Images column added successfully!');
  } catch (error) {
    console.error('❌ Error adding images column:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

addImagesColumn();
