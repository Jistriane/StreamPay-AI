import { NextResponse } from 'next/server';

// NOTE: Viem type handling commented out - using backend API instead
// Frontend streams are fetched from backend `/api/streams` endpoint
// See: frontend/app/lib/api.ts and frontend/app/dashboard/page.tsx

export async function GET(request: Request) {
  // Redirect to backend API
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/streams${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
  }
}