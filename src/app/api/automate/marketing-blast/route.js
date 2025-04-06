import { NextResponse } from 'next/server';

// This API route proxies requests to the Flask automation tool for marketing blasts

export async function POST(request) {
  const targetUrl = 'https://delicate-close-oyster.ngrok-free.app/api/send/marketing_blast'; // Flask endpoint via Ngrok

  try {
    // 1. Get the JSON body from the incoming Next.js request
    const requestBody = await request.json();
    console.log(`[API Route /api/automate/marketing-blast] Received request with body:`, requestBody);

    // Basic validation (Flask also validates, but good practice)
    if (!requestBody.subject || !requestBody.body) {
        return new NextResponse(JSON.stringify({ message: 'Missing subject or body in request' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Forward the request (including the body) to the Flask endpoint
    console.log(`[API Route /api/automate/marketing-blast] Forwarding POST request to ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Tell Flask we're sending JSON
        // Add other headers if needed, but avoid forwarding arbitrary client headers
      },
      body: JSON.stringify(requestBody), // Forward the received body
    });

    // 3. Process the response from Flask
    const responseBodyText = await response.text(); 
    console.log(`[API Route /api/automate/marketing-blast] Response from ${targetUrl}: Status ${response.status}, Body: ${responseBodyText}`);

    let data;
    try {
        data = JSON.parse(responseBodyText); 
    } catch (e) {
        console.error("[API Route /api/automate/marketing-blast] Failed to parse Flask response as JSON:", e);
        data = { message: responseBodyText || "Received non-JSON response from automation server." }; 
    }

    // 4. Return Flask's response (or error) to the client
    if (!response.ok) {
        console.error(`[API Route /api/automate/marketing-blast] Error from ${targetUrl}: Status ${response.status}`);
        return new NextResponse(JSON.stringify(data), { 
            status: response.status, // Use Flask's status code
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new NextResponse(JSON.stringify(data), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API Route /api/automate/marketing-blast] Error:', error);
    
    // Handle potential JSON parsing errors from the incoming request too
    if (error instanceof SyntaxError) {
         return new NextResponse(JSON.stringify({ message: 'Invalid JSON format in request body' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error proxying request' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
    });
  }
} 