'use client'

export const dynamic = 'force-dynamic'

export default function JobsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your job applications
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
        <p className="text-gray-500 mb-4">
          Start browsing LinkedIn with the Chrome extension to save jobs here
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Install Chrome Extension
        </button>
      </div>
    </div>
  )
}