'use client'

export const dynamic = 'force-dynamic'

export default function ResumePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage multiple resume versions
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">Resume Builder</h3>
        <p className="text-gray-500 mb-4">
          Create tailored resumes for different job opportunities
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Resume
        </button>
      </div>
    </div>
  )
}