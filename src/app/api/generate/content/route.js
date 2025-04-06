import { generateSocialMediaPost } from '@/lib/ai';

export async function POST(request) {
  try {
    const { prompt, platform, tone } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const content = await generateSocialMediaPost(prompt, platform, tone);
    
    return new Response(
      JSON.stringify(content),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 