import { NextResponse } from 'next/server';

// This API route proxies requests to the Flask automation tool

export async function POST(request) {
  const targetUrl = 'https://delicate-close-oyster.ngrok-free.app/api/send/recent_emails'; // Flask endpoint via Ngrok

  try {
    console.log(`[API Route /api/automate/recent-emails] Forwarding POST request to ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: 'POST',
      // No body needed for this specific endpoint based on Flask app
    });

    const responseBody = await response.text(); // Read body first
    console.log(`[API Route /api/automate/recent-emails] Response from ${targetUrl}: Status ${response.status}, Body: ${responseBody}`);

    // Try parsing as JSON, but handle cases where it might not be
    let data;
    try {
        data = JSON.parse(responseBody); 
    } catch (e) {
        console.error("[API Route /api/automate/recent-emails] Failed to parse Flask response as JSON:", e);
        // If Flask sends plain text on error, use that
        data = { message: responseBody || "Received non-JSON response from automation server." }; 
    }

    // Check if the external request was successful based on status code
    if (!response.ok) {
        console.error(`[API Route /api/automate/recent-emails] Error from ${targetUrl}: Status ${response.status}`);
      // Return the error status and message from the target server if possible
      return new NextResponse(JSON.stringify(data), { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Return the success response from the target server to the client
    return new NextResponse(JSON.stringify(data), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API Route /api/automate/recent-emails] Error:', error);
    // Return a generic server error response
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error proxying request' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
    });
  }
} 