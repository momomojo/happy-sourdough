import { createClient } from '@/lib/supabase/server';

export interface LoyaltyStatus {
    points_balance: number;
    lifetime_points: number;
    tier: 'bronze' | 'silver' | 'gold';
}

/**
 * Get current loyalty status for a user
 */
export async function getLoyaltyStatus(userId: string): Promise<LoyaltyStatus | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('loyalty_points')
        .select('points, lifetime_points, tier')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        console.error('Error fetching loyalty status:', error);
        return null;
    }

    return {
        points_balance: data.points ?? 0,
        lifetime_points: data.lifetime_points ?? 0,
        tier: (data.tier as 'bronze' | 'silver' | 'gold') || 'bronze',
    };
}

/**
 * Redeem points for a discount code
 * Returns the generated discount code string
 */
export async function redeemPoints(pointsToRedeem: number): Promise<{ success: boolean; code?: string; error?: string }> {
    const supabase = await createClient();

    try {
        const { data: userResponse } = await supabase.auth.getUser();
        if (!userResponse.user) throw new Error('Not authenticated');

        // Call the database function
        // Note: The function returns JSONB directly
        const { data, error } = await supabase.rpc('redeem_loyalty_points', {
            user_id_param: userResponse.user.id,
            points_to_redeem: pointsToRedeem
        });

        if (error) throw error;

        const result = data as { success: boolean; code?: string; error?: string };

        if (result.success && result.code) {
            return { success: true, code: result.code };
        }

        return {
            success: false,
            error: result.error || 'Redemption failed'
        };

    } catch (err) {
        console.error('Error redeeming points:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Redemption failed' };
    }
}
