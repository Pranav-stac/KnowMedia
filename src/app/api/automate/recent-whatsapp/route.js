import { NextResponse } from 'next/server';

// This API route proxies requests to the Flask automation tool

export async function POST(request) {
  const targetUrl = 'https://delicate-close-oyster.ngrok-free.app/api/send/recent_whatsapp'; // Flask endpoint via Ngrok

  try {
    console.log(`[API Route /api/automate/recent-whatsapp] Forwarding POST request to ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: 'POST',
      // No body needed for this specific endpoint based on Flask app
    });

    const responseBody = await response.text(); 
    console.log(`[API Route /api/automate/recent-whatsapp] Response from ${targetUrl}: Status ${response.status}, Body: ${responseBody}`);

    let data;
    try {
        data = JSON.parse(responseBody); 
    } catch (e) {
        console.error("[API Route /api/automate/recent-whatsapp] Failed to parse Flask response as JSON:", e);
        data = { message: responseBody || "Received non-JSON response from automation server." }; 
    }

    if (!response.ok) {
        console.error(`[API Route /api/automate/recent-whatsapp] Error from ${targetUrl}: Status ${response.status}`);
        return new NextResponse(JSON.stringify(data), { 
            status: response.status, 
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new NextResponse(JSON.stringify(data), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API Route /api/automate/recent-whatsapp] Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error proxying request' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
    });
  }
} 