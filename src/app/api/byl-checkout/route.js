import { NextResponse } from 'next/server';

// BYL API configuration
const BYL_API_URL = 'https://byl.mn/api/v1';
const BYL_API_TOKEN = process.env.BYL_API_TOKEN;
const BYL_PROJECT_ID = process.env.BYL_PROJECT_ID;

export async function POST(request) {
  try {
    const checkoutData = await request.json();
    
    // Validate required environment variables
    if (!BYL_API_TOKEN || !BYL_PROJECT_ID) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'BYL API credentials not configured' 
        },
        { status: 500 }
      );
    }

    // Make request to BYL API
    const response = await fetch(`${BYL_API_URL}/projects/${BYL_PROJECT_ID}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYL_API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('BYL API Error:', result);
      return NextResponse.json(
        { 
          success: false, 
          error: `BYL API Error: ${response.status}`,
          details: result
        },
        { status: response.status }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      checkout: result
    });

  } catch (error) {
    console.error('BYL checkout creation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create BYL checkout',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
