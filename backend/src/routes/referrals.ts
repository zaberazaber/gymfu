import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import ReferralModel from '../models/Referral';
import { UserModel } from '../models/User';

const router = express.Router();

// Get user's referral code
router.get('/code', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ referralCode: user.referralCode });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ error: 'Failed to fetch referral code' });
  }
});

// Get user's referral stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await ReferralModel.getReferralStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Get user's referrals
router.get('/list', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const referrals = await ReferralModel.findByReferrerId(userId);
    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get user's reward points balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      rewardPoints: user.rewardPoints || 0,
      referralCode: user.referralCode 
    });
  } catch (error) {
    console.error('Error fetching reward balance:', error);
    res.status(500).json({ error: 'Failed to fetch reward balance' });
  }
});

export default router;
