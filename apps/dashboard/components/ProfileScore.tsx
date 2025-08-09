'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { User, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProfileScoreProps {
  score: number
}

export function ProfileScore({ score }: ProfileScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Incomplete'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User size={20} />
          <span>Profile Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-sm text-muted-foreground">
            {getScoreLabel(score)}
          </div>
        </div>
        
        <Progress value={score} className="w-full" />
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Next milestone</span>
            <span className="font-medium">85%</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {score < 85 ? `${85 - score} points to go` : 'Profile optimized!'}
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/profile">
            <TrendingUp size={14} className="mr-2" />
            Improve Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}