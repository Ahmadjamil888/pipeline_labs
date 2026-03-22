import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

export async function GET(
  request: NextRequest,
  { params }: { params: { deploy_id: string } }
) {
  const { deploy_id } = params
  const url = `${API_URL}/api/v1/deployments/${deploy_id}${request.nextUrl.search}`

  try {
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Forward all headers except host
        ...Object.fromEntries(
          request.headers.entries().filter(([key]) => key.toLowerCase() !== 'host')
        ),
      },
    })

    // Return the response from the backend
    const data = await response.arrayBuffer()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        // Forward all headers except connection-specific ones
        ...Object.fromEntries(
          response.headers.entries().filter(
            ([key]) => !['connection', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())
          )
        ),
      },
    })
  } catch (error) {
    console.error('Deployment proxy error:', error)
    return NextResponse.json(
      { error: 'Deployment temporarily unavailable' },
      { status: 502 }
    )
  }
}
