import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pgPool } from '../config/database';

const router = Router();
const execAsync = promisify(exec);

// Migration endpoint - call this once to set up tables
router.post('/run', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Running database migration...');
    
    // Run the migration script
    const { stdout, stderr } = await execAsync('npm run db:create');
    
    console.log('Migration output:', stdout);
    if (stderr) console.error('Migration errors:', stderr);
    
    res.json({
      success: true,
      message: 'Database migration completed successfully',
      output: stdout
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// Add is_partner column migration
router.post('/add-is-partner', async (_req: Request, res: Response) => {
  try {
    console.log('🔄 Adding is_partner column...');
    
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE;
    `;

    await pgPool.query(query);
    
    // Verify the column was added
    const verifyQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_partner';
    `;
    
    const result = await pgPool.query(verifyQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ is_partner column added successfully');
      res.json({
        success: true,
        message: 'is_partner column added successfully',
        column: result.rows[0]
      });
    } else {
      throw new Error('Column was not created');
    }
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// Add all missing user columns
router.post('/add-user-columns', async (_req: Request, res: Response) => {
  try {
    console.log('🔄 Adding missing user columns...');
    
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS location JSONB,
      ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
      ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `;

    await pgPool.query(query);
    
    // Verify columns were added
    const verifyQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    const result = await pgPool.query(verifyQuery);
    
    console.log('✅ User columns migration completed');
    res.json({
      success: true,
      message: 'User columns added successfully',
      columns: result.rows
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

export default router;
