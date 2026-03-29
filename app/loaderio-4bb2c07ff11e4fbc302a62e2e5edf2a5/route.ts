import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('loaderio-4bb2c07ff11e4fbc302a62e2e5edf2a5', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
