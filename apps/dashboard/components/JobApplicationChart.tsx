'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export function JobApplicationChart() {
  // Mock data for the last 7 days
  const chartData = [
    { day: 'Mon', applications: 2, responses: 0 },
    { day: 'Tue', applications: 1, responses: 1 },
    { day: 'Wed', applications: 3, responses: 0 },
    { day: 'Thu', applications: 0, responses: 2 },
    { day: 'Fri', applications: 2, responses: 1 },
    { day: 'Sat', applications: 1, responses: 0 },
    { day: 'Sun', applications: 0, responses: 0 },
  ]

  const maxValue = Math.max(...chartData.map(d => Math.max(d.applications, d.responses)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp size={20} />
          <span>Application Activity (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end justify-between h-32 px-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="flex space-x-1">
                  {/* Applications bar */}
                  <div
                    className="bg-blue-500 rounded-t w-3"
                    style={{
                      height: `${(data.applications / (maxValue || 1)) * 80}px`,
                      minHeight: data.applications > 0 ? '4px' : '0px'
                    }}
                  />
                  {/* Responses bar */}
                  <div
                    className="bg-green-500 rounded-t w-3"
                    style={{
                      height: `${(data.responses / (maxValue || 1)) * 80}px`,
                      minHeight: data.responses > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-muted-foreground">Applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-muted-foreground">Responses</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chartData.reduce((sum, d) => sum + d.applications, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {chartData.reduce((sum, d) => sum + d.responses, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Responses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((chartData.reduce((sum, d) => sum + d.responses, 0) / 
                  chartData.reduce((sum, d) => sum + d.applications, 0)) * 100) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Response Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}