'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Gift, ArrowRight, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { redeemPoints } from '@/actions/loyalty-actions'; // We'll need a server action for this to be called from client

// Define props based on what we'll pass from the server page
interface LoyaltyDashboardProps {
    pointsBalance: number;
    lifetimePoints: number;
    tier: 'bronze' | 'silver' | 'gold';
}

export function LoyaltyDashboard({ pointsBalance, lifetimePoints, tier }: LoyaltyDashboardProps) {
    const [isRedeeming, setIsRedeeming] = useState(false);

    // Calculate progress to next tier
    // Bronze: 0-499, Silver: 500-1499, Gold: 1500+
    let nextTierPoints = 500;
    let progress = 0;
    let nextTierName = 'Silver';

    if (tier === 'silver') {
        nextTierPoints = 1500;
        nextTierName = 'Gold';
        progress = ((lifetimePoints - 500) / (1500 - 500)) * 100;
    } else if (tier === 'bronze') {
        progress = (lifetimePoints / 500) * 100;
    } else {
        progress = 100; // Gold is max
        nextTierName = 'Max Tier';
    }

    const handleRedeem = async () => {
        if (pointsBalance < 100) return;

        setIsRedeeming(true);
        try {
            const result = await redeemPoints(100); // Redeem 100 points for $5
            if (result.success && result.code) {
                toast.success(`Reward Redeemed! Code: ${result.code}`, {
                    description: 'Copy this code to use at checkout via the code manager.',
                    duration: 10000,
                });
                // Ideally we refresh the page data here
                // router.refresh() 
            } else {
                toast.error('Redemption failed: ' + result.error);
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsRedeeming(false);
        }
    };

    const getTierColor = (t: string) => {
        switch (t) {
            case 'gold': return 'bg-yellow-500 text-black border-yellow-600';
            case 'silver': return 'bg-slate-300 text-slate-800 border-slate-400';
            default: return 'bg-orange-700 text-white border-orange-800'; // Bronze
        }
    };

    return (
        <Card className="border-2 shadow-md hover:shadow-lg transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-10" />
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Loyalty Rewards</CardTitle>
                            <CardDescription>Earn points with every loaf</CardDescription>
                        </div>
                    </div>
                    <Badge className={`px-3 py-1 text-sm font-bold capitalize ${getTierColor(tier)}`}>
                        {tier} Member
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Points Balance */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Current Balance</p>
                        <h3 className="text-4xl font-extrabold text-primary">{pointsBalance} <span className="text-lg font-medium text-muted-foreground">pts</span></h3>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Lifetime Earned</p>
                        <p className="text-xl font-bold">{lifetimePoints} pts</p>
                    </div>
                </div>

                {/* Tier Progress */}
                {tier !== 'gold' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">Progress to {nextTierName}</span>
                            <span className="font-bold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                            {nextTierPoints - lifetimePoints} more points to reach {nextTierName}
                        </p>
                    </div>
                )}

                {/* Rewards Section */}
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                    <div className="flex items-center gap-3 mb-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Available Rewards</h4>
                    </div>

                    <div className="flex items-center justify-between bg-background rounded-md p-3 border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                                $5
                            </div>
                            <div>
                                <p className="font-medium">$5 Off Order</p>
                                <p className="text-xs text-muted-foreground">Cost: 100 points</p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleRedeem}
                            disabled={pointsBalance < 100 || isRedeeming}
                            variant={pointsBalance >= 100 ? "default" : "outline"}
                        >
                            {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
