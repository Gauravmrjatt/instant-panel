'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Medal, Award, Crown } from 'lucide-react'

interface TopUser {
  _id: string
  username: string
  totalAmount: number
  paymentCount: number
}

interface TopUsersProps {
  users: TopUser[]
  isLoading?: boolean
}

const rankIcons = [Crown, Trophy, Medal, Award, Award]
const rankColors = [
  'text-amber-500 bg-amber-500/10',
  'text-slate-400 bg-slate-400/10',
  'text-amber-700 bg-amber-700/10',
  'text-muted-foreground bg-muted',
  'text-muted-foreground bg-muted',
]

export function TopUsers({ users, isLoading }: TopUsersProps) {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

  const getInitials = (name: string) => {
    return name
      .split(/[@\s]/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top Performers</CardTitle>
            <CardDescription>Highest earning users</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            Leaderboard
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No data available</p>
          </div>
        ) : (
          users.map((user, index) => {
            const RankIcon = rankIcons[index]
            const rankColor = rankColors[index]
            const rank = index + 1

            return (
              <div
                key={user._id}
                className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className={`p-2 rounded-lg ${rankColor}`}>
                  <RankIcon className="h-4 w-4" />
                </div>

                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.paymentCount.toLocaleString()} payments
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatAmount(user.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">Rank #{rank}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
