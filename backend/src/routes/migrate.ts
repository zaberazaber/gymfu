import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

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

export default router;
