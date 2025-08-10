'use client'

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/components/DashboardStats'
import { RecentJobs } from '@/components/RecentJobs'
import { QuickActions } from '@/components/QuickActions'
import { ProfileScore } from '@/components/ProfileScore'
import { UpcomingInterviews } from '@/components/UpcomingInterviews'
import { JobApplicationChart } from '@/components/JobApplicationChart'
import { useSupabase } from '@/lib/supabase-provider'

export default function DashboardPage() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalJobs: number
      appliedJobs: number
      interviewsScheduled: number
      offersReceived: number
    }
    recentJobs: any[]
    profileScore: number
    upcomingInterviews: any[]
  }>({
    stats: {
      totalJobs: 0,
      appliedJobs: 0,
      interviewsScheduled: 0,
      offersReceived: 0
    },
    recentJobs: [],
    profileScore: 75,
    upcomingInterviews: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get job statistics
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      const stats = {
        totalJobs: jobs?.length || 0,
        appliedJobs: jobs?.filter(job => job.status !== 'saved').length || 0,
        interviewsScheduled: jobs?.filter(job => job.status === 'interviewing').length || 0,
        offersReceived: jobs?.filter(job => job.status === 'offer').length || 0
      }

      // Get recent jobs (last 5)
      const recentJobs = jobs?.slice(0, 5) || []

      // Get profile score (mock data for now)
      const profileScore = 75

      // Get upcoming interviews (mock data for now)
      const upcomingInterviews = jobs?.filter(job => 
        job.status === 'interviewing' && job.interview_date
      ).slice(0, 3) || []

      setDashboardData({
        stats,
        recentJobs,
        profileScore,
        upcomingInterviews
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-linkedin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="gradient-header rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-linkedin-100 opacity-90">
          Track and manage your job applications with AI insights
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Dashboard Stats */}
      <DashboardStats stats={dashboardData.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <RecentJobs jobs={dashboardData.recentJobs} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Profile Score */}
          <ProfileScore score={dashboardData.profileScore} />
          
          {/* Upcoming Interviews */}
          <UpcomingInterviews interviews={dashboardData.upcomingInterviews} />
        </div>
      </div>

      {/* Job Application Chart */}
      <JobApplicationChart />
    </div>
  )
}