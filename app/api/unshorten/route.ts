import { NextResponse } from 'next/server';

// This enforces the Vercel Edge Runtime for maximum speed and lower costs
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'A URL parameter is required' },
      { status: 400 }
    );
  }

  const modalApiUrl = process.env.MODAL_API_URL;
  
  if (!modalApiUrl) {
    console.error("Missing MODAL_API_URL in environment variables.");
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    // Proxy the request to our hidden Modal backend
    const targetUrl = `${modalApiUrl}/unshorten?url=${encodeURIComponent(url)}`;
    
    // Using fetch on the edge. Note: Modal handles the actual timeout logic.
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Modal API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}