'use server';

import { redeemPoints as redeemPointsLib } from '@/lib/loyalty';
import { revalidatePath } from 'next/cache';

export async function redeemPoints(points: number) {
    const result = await redeemPointsLib(points);
    if (result.success) {
        revalidatePath('/account');
    }
    return result;
}

export async function fetchLoyaltyStatus(userId: string) {
    // We import the lib function dynamically or assume usage in server context
    // Actually we can reuse getLoyaltyStatus from lib/loyalty
    const { getLoyaltyStatus } = await import('@/lib/loyalty');
    return await getLoyaltyStatus(userId);
}
