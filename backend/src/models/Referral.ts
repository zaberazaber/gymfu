import { pgPool } from '../config/database';

export interface Referral {
  id: number;
  referrerId: number;
  referredUserId: number;
  status: 'pending' | 'completed' | 'rewarded';
  rewardsCredited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReferralData {
  referrerId: number;
  referredUserId: number;
}

class ReferralModel {
  async create(data: CreateReferralData): Promise<Referral> {
    const query = `
      INSERT INTO referrals (referrer_id, referred_user_id, status, rewards_credited, created_at, updated_at)
      VALUES ($1, $2, 'pending', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        referrer_id as "referrerId",
        referred_user_id as "referredUserId",
        status,
        rewards_credited as "rewardsCredited",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [data.referrerId, data.referredUserId]);
    return result.rows[0];
  }

  async findByReferrerId(referrerId: number): Promise<Referral[]> {
    const query = `
      SELECT 
        id,
        referrer_id as "referrerId",
        referred_user_id as "referredUserId",
        status,
        rewards_credited as "rewardsCredited",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM referrals
      WHERE referrer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pgPool.query(query, [referrerId]);
    return result.rows;
  }

  async findByReferredUserId(referredUserId: number): Promise<Referral | null> {
    const query = `
      SELECT 
        id,
        referrer_id as "referrerId",
        referred_user_id as "referredUserId",
        status,
        rewards_credited as "rewardsCredited",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM referrals
      WHERE referred_user_id = $1
    `;

    const result = await pgPool.query(query, [referredUserId]);
    return result.rows[0] || null;
  }

  async updateStatus(id: number, status: Referral['status']): Promise<Referral | null> {
    const query = `
      UPDATE referrals
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id,
        referrer_id as "referrerId",
        referred_user_id as "referredUserId",
        status,
        rewards_credited as "rewardsCredited",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  async markRewardsCredited(id: number): Promise<Referral | null> {
    const query = `
      UPDATE referrals
      SET rewards_credited = TRUE, status = 'rewarded', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        referrer_id as "referrerId",
        referred_user_id as "referredUserId",
        status,
        rewards_credited as "rewardsCredited",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getReferralStats(referrerId: number): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalPointsEarned: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'rewarded' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN rewards_credited = TRUE THEN 1 END) * 100 as total_points_earned
      FROM referrals
      WHERE referrer_id = $1
    `;

    const result = await pgPool.query(query, [referrerId]);
    const row = result.rows[0];

    return {
      totalReferrals: parseInt(row.total_referrals),
      completedReferrals: parseInt(row.completed_referrals),
      pendingReferrals: parseInt(row.pending_referrals),
      totalPointsEarned: parseInt(row.total_points_earned),
    };
  }
}

export default new ReferralModel();
