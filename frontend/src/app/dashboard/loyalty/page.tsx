'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Award,
  Star,
  Gift,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
  Crown,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

// Mock loyalty data
const mockLoyaltyData = {
  points: 2450,
  pointsValue: 2450, // 1 point = 1 KES
  tier: 'Gold',
  nextTier: 'Platinum',
  pointsToNextTier: 550,
  lifetimePoints: 5200,
  pointsHistory: [
    {
      id: '1',
      action: 'Policy Purchase - Motor Insurance',
      points: 500,
      date: '2026-01-28',
      type: 'earned'
    },
    {
      id: '2',
      action: 'Referral Bonus - Friend Signup',
      points: 250,
      date: '2026-01-25',
      type: 'earned'
    },
    {
      id: '3',
      action: 'Redeemed for Medical Insurance Discount',
      points: -1000,
      date: '2026-01-20',
      type: 'redeemed'
    },
    {
      id: '4',
      action: 'On-Time Premium Payment',
      points: 100,
      date: '2026-01-15',
      type: 'earned'
    },
    {
      id: '5',
      action: 'Policy Renewal - Home Insurance',
      points: 300,
      date: '2026-01-10',
      type: 'earned'
    },
  ],
  rewards: [
    {
      id: '1',
      title: '10% Discount on Next Premium',
      pointsCost: 1000,
      description: 'Get 10% off on your next policy premium payment',
      category: 'discount',
      available: true
    },
    {
      id: '2',
      title: 'Free Motor Insurance Add-on',
      pointsCost: 2000,
      description: 'Add windscreen cover or personal accident cover for free',
      category: 'upgrade',
      available: true
    },
    {
      id: '3',
      title: 'Free Policy for 1 Month',
      pointsCost: 5000,
      description: 'Get any policy completely free for one month',
      category: 'free',
      available: false
    },
    {
      id: '4',
      title: '20% Discount on Next Premium',
      pointsCost: 1800,
      description: 'Get 20% off on your next policy premium payment',
      category: 'discount',
      available: true
    },
  ],
  earningOpportunities: [
    {
      id: '1',
      title: 'Refer a Friend',
      points: 250,
      description: 'Earn points when your friend purchases a policy',
      icon: Users
    },
    {
      id: '2',
      title: 'Complete Your Profile',
      points: 50,
      description: 'Add all required information to your profile',
      icon: CheckCircle2
    },
    {
      id: '3',
      title: 'On-Time Payments',
      points: 100,
      description: 'Earn bonus points for paying premiums on time',
      icon: Calendar
    },
    {
      id: '4',
      title: 'Purchase New Policy',
      points: 500,
      description: 'Earn points with every new policy purchase',
      icon: Award
    },
  ]
}

const tiers = [
  { name: 'Bronze', minPoints: 0, color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-950' },
  { name: 'Silver', minPoints: 1000, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  { name: 'Gold', minPoints: 2000, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950' },
  { name: 'Platinum', minPoints: 3000, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
]

function Users({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}

export default function LoyaltyPage() {
  const [loyaltyData] = useState(mockLoyaltyData)

  const currentTierIndex = tiers.findIndex(t => t.name === loyaltyData.tier)
  const nextTierIndex = currentTierIndex + 1
  const progressToNextTier = nextTierIndex < tiers.length
    ? ((loyaltyData.points - tiers[currentTierIndex].minPoints) / (tiers[nextTierIndex].minPoints - tiers[currentTierIndex].minPoints)) * 100
    : 100

  const handleRedeem = (reward: any) => {
    if (reward.pointsCost > loyaltyData.points) {
      alert('Insufficient points')
      return
    }
    alert(`Redeemed: ${reward.title}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          Loyalty Program
        </h1>
        <p className="text-muted-foreground mt-2">
          Earn points and redeem exclusive rewards
        </p>
      </div>

      {/* Points Balance Card */}
      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-2">Your Points Balance</p>
              <h2 className="text-5xl font-bold">{loyaltyData.points.toLocaleString()}</h2>
              <p className="text-sm opacity-90 mt-2">
                ≈ KES {loyaltyData.pointsValue.toLocaleString()} in value
              </p>
            </div>
            <Trophy className="h-20 w-20 opacity-50" />
          </div>

          {/* Tier Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Current Tier: {loyaltyData.tier}</span>
              </div>
              {nextTierIndex < tiers.length && (
                <span className="text-sm opacity-90">
                  {loyaltyData.pointsToNextTier} points to {loyaltyData.nextTier}
                </span>
              )}
            </div>
            {nextTierIndex < tiers.length && (
              <Progress value={progressToNextTier} className="h-2 bg-purple-900" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData.lifetimePoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData.tier}</div>
            <p className="text-xs text-muted-foreground">Member status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyData.rewards.filter(r => r.pointsCost <= loyaltyData.points).length}
            </div>
            <p className="text-xs text-muted-foreground">Can redeem now</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Membership Tiers
          </CardTitle>
          <CardDescription>Progress through tiers to unlock better rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border-2 ${
                  tier.name === loyaltyData.tier
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <div className={`${tier.bgColor} ${tier.color} p-2 rounded-full w-fit mb-2`}>
                  <Crown className="h-6 w-6" />
                </div>
                <h4 className="font-bold">{tier.name}</h4>
                <p className="text-xs text-muted-foreground">{tier.minPoints}+ points</p>
                {tier.name === loyaltyData.tier && (
                  <Badge variant="default" className="mt-2">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Rewards
            </CardTitle>
            <CardDescription>Redeem your points for exclusive benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyData.rewards.map((reward) => {
                const canRedeem = reward.pointsCost <= loyaltyData.points && reward.available
                return (
                  <div
                    key={reward.id}
                    className={`p-4 border rounded-lg ${
                      !canRedeem ? 'opacity-60' : 'hover:bg-muted/50'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {reward.title}
                          {reward.category === 'free' && <Sparkles className="h-4 w-4 text-amber-500" />}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-bold">{reward.pointsCost.toLocaleString()} points</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canRedeem}
                        onClick={() => handleRedeem(reward)}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Earn More Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Earn More Points
            </CardTitle>
            <CardDescription>Ways to increase your points balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyData.earningOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <opportunity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-sm">+{opportunity.points} points</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
          <CardDescription>Recent earning and redemption activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loyaltyData.pointsHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {entry.type === 'earned' ? (
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950">
                      <Gift className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    entry.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                  }`}
                >
                  {entry.type === 'earned' ? '+' : ''}{entry.points} pts
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
