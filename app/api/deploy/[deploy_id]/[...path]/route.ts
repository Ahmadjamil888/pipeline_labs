import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pipeline-ai-labs-by-ahmad.up.railway.app'

export async function GET(
  request: NextRequest,
  { params }: { params: { deploy_id: string; path: string[] } }
) {
  const { deploy_id, path } = params
  const fullPath = path.join('/')
  const url = `${API_URL}/api/v1/deployments/${deploy_id}/${fullPath}${request.nextUrl.search}`

  try {
    // Forward the request to the backend
    const response = await fetch(url, {
      method: request.method,
      headers: {
        // Forward all headers except host
        ...Object.fromEntries(
          request.headers.entries().filter(([key]) => key.toLowerCase() !== 'host')
        ),
      },
      // Forward body if it exists
      body: request.body,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { deploy_id: string; path: string[] } }
) {
  const { deploy_id, path } = params
  const fullPath = path.join('/')
  const url = `${API_URL}/api/v1/deployments/${deploy_id}/${fullPath}`

  try {
    // Get the request body
    const body = await request.text()
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        // Forward all headers except host and content-length
        ...Object.fromEntries(
          request.headers.entries().filter(([key]) => 
            !['host', 'content-length'].includes(key.toLowerCase())
          )
        ),
      },
      body,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { deploy_id: string; path: string[] } }
) {
  return POST(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { deploy_id: string; path: string[] } }
) {
  const { deploy_id, path } = params
  const fullPath = path.join('/')
  const url = `${API_URL}/api/v1/deployments/${deploy_id}/${fullPath}`

  try {
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'DELETE',
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
