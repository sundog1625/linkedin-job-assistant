import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // For now, we'll return an error for PDF files and suggest alternatives
    // In production, you would integrate a proper PDF parsing service
    
    if (file.type === 'application/pdf') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PDF parsing is not yet available. Please copy and paste your CV content instead, or convert the PDF to text first.',
          suggestion: 'You can open the PDF, select all text (Ctrl+A), copy it, and paste it in the text area below.'
        },
        { status: 422 }
      )
    }

    // Handle other file types that might be sent here
    return NextResponse.json(
      { success: false, error: 'Unsupported file type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}