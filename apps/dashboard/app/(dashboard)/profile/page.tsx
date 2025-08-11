'use client'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">LinkedIn Profile Optimizer</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your LinkedIn profile to attract recruiters
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold mb-2">Profile Analysis</h3>
        <p className="text-gray-500 mb-4">
          Get AI-powered suggestions to improve your LinkedIn profile
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Analyze Profile
        </button>
      </div>
    </div>
  )
}