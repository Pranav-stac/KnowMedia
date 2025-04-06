import { NextResponse } from 'next/server';

export async function POST(request) {
  const targetUrl = 'http://127.0.0.1:5001/api/send/recent_emails'; // Your automation endpoint

  try {
    // Forward the request to the target URL
    // Note: We are simply forwarding a POST request here. 
    // If the original request needs to send data (body), 
    // you would need to read it from the incoming `request` object 
    // and include it in the fetch options below.
    const response = await fetch(targetUrl, {
      method: 'POST',
      // Add headers or body if needed based on what your automation endpoint expects
      // headers: request.headers, // Example: forward original headers (be cautious with this)
      // body: await request.text(), // Example: forward request body
    });

    // Check if the external request was successful
    if (!response.ok) {
      // Return the error status from the target server
      return new NextResponse(`Error from automation endpoint: ${response.statusText}`, { status: response.status });
    }

    // Optionally process the response from the target server
    // const data = await response.json(); 
    
    // Return a success response to the client
    return NextResponse.json({ message: 'Automation triggered successfully via proxy.' });

  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return a generic server error response
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 