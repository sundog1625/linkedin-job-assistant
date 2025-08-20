import { NextRequest, NextResponse } from 'next/server'

// Try to import pdf-parse, fall back if not available
let pdfParse: any = null
try {
  pdfParse = require('pdf-parse-fork')
} catch (error) {
  console.log('PDF parsing library not available')
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!pdfParse) {
    throw new Error('PDF parsing library not available')
  }
  
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

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

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported for parsing' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`)

    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(buffer)
      
      if (!extractedText || extractedText.trim().length < 10) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Could not extract readable text from PDF. The PDF might be image-based or corrupted.' 
          },
          { status: 422 }
        )
      }

      // Clean up the extracted text
      const cleanText = extractedText
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .trim()

      console.log(`Successfully extracted ${cleanText.length} characters from PDF: ${file.name}`)

      return NextResponse.json({
        success: true,
        text: cleanText,
        metadata: {
          filename: file.name,
          fileSize: file.size,
          textLength: cleanText.length,
          extractedAt: new Date().toISOString()
        }
      })

    } catch (parseError) {
      console.error('PDF parsing failed:', parseError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse PDF. The file might be corrupted, password-protected, or image-based.' 
        },
        { status: 422 }
      )
    }

  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while processing file' 
      },
      { status: 500 }
    )
  }
}