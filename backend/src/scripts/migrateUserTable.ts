import { pgPool } from '../config/database';

async function migrateUserTable() {
  try {
    console.log('🔄 Migrating users table...');

    // Add all missing columns in one go
    const query = `
      -- Add is_partner column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='is_partner'
        ) THEN
          ALTER TABLE users ADD COLUMN is_partner BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added is_partner column';
        END IF;
      END $$;

      -- Add age column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='age'
        ) THEN
          ALTER TABLE users ADD COLUMN age INTEGER;
          RAISE NOTICE 'Added age column';
        END IF;
      END $$;

      -- Add gender column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='gender'
        ) THEN
          ALTER TABLE users ADD COLUMN gender VARCHAR(20);
          RAISE NOTICE 'Added gender column';
        END IF;
      END $$;

      -- Add location column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='location'
        ) THEN
          ALTER TABLE users ADD COLUMN location JSONB;
          RAISE NOTICE 'Added location column';
        END IF;
      END $$;

      -- Add fitness_goals column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='fitness_goals'
        ) THEN
          ALTER TABLE users ADD COLUMN fitness_goals TEXT[];
          RAISE NOTICE 'Added fitness_goals column';
        END IF;
      END $$;

      -- Add profile_image column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='profile_image'
        ) THEN
          ALTER TABLE users ADD COLUMN profile_image TEXT;
          RAISE NOTICE 'Added profile_image column';
        END IF;
      END $$;
    `;

    await pgPool.query(query);
    console.log('✅ Users table migration completed successfully');

    // Show current table structure
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    const result = await pgPool.query(columnsQuery);
    console.log('\n📋 Current users table structure:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error migrating users table:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

// Run the migration
migrateUserTable()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
