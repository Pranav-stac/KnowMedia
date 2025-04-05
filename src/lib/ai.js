import { GoogleGenAI } from "@google/genai";

// Initialize Google AI with API key
// In production, use environment variables for API keys
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "AIzaSyAAaTyvPv33KC_KKBIz-GGr2l82oKg9Bhg";
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

/**
 * Generate text content using Google's Gemini API
 * @param {string} prompt - The text prompt to generate content from
 * @param {string} context - Optional context to guide the generation
 * @returns {Promise<string>} - The generated text
 */
export async function generateText(prompt, context = "") {
  try {
    // For error-free development if API is not available
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "AIzaSyAAaTyvPv33KC_KKBIz-GGr2l82oKg9Bhg") {
      console.warn("No API key found, using mock response");
      return `Generated content for: "${prompt}".\n\nThis is a mock response because no valid API key was provided.`;
    }

    const generativeModel = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    const result = await generativeModel.generateContent({
      contents: [{ text: context ? `${context}\n\n${prompt}` : prompt }],
    });
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text with AI:", error);
    // Return a mock response when in development to avoid breaking the UI
    return `Failed to generate content. Please check your API key and try again.`;
  }
}

/**
 * Generate an image using the API
 * @param {string} prompt - The text prompt to generate an image from
 * @returns {Promise<string>} - The generated image data URL
 */
export async function generateImage(prompt) {
  try {
    // API endpoint for image generation
    const response = await fetch("https://pranavai.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt })
    });
    
    if (response.status !== 200) {
      throw new Error(`Image generation failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.images && result.images.length > 0 && result.images[0].url) {
      return result.images[0].url;
    } else {
      // Use fallback image
      console.warn("No image was returned by the API, using fallback");
      return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
    }
  } catch (error) {
    console.error("Error generating image with AI:", error);
    // Return a fallback image URL instead of throwing an error
    return 'https://images.unsplash.com/photo-1535957998253-26ae1ef29506?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
  }
}

/**
 * Generate a social media post using AI
 * @param {string} topic - The topic of the post
 * @param {string} platform - The platform (instagram, linkedin, etc.)
 * @param {string} tone - The tone of the post (professional, casual, etc.)
 * @returns {Promise<string>} - The generated post text
 */
export async function generateSocialMediaPost(topic, platform = "linkedin", tone = "professional") {
  try {
    const prompt = `Write a social media post about ${topic} for ${platform}. Use a ${tone} tone.`;
    return await generateText(prompt);
  } catch (error) {
    console.error("Error generating social media post:", error);
    return `Here's a sample ${platform} post about ${topic} (AI generation failed).`;
  }
}

/**
 * Generate content ideas using AI
 * @param {string} industry - The industry or niche
 * @param {number} count - Number of ideas to generate
 * @returns {Promise<string[]>} - Array of content ideas
 */
export async function generateContentIdeas(industry, count = 5) {
  try {
    const prompt = `Generate ${count} content ideas for ${industry} that would perform well on social media.`;
    const text = await generateText(prompt);
    
    // Split the text into an array of ideas
    let ideas = text.split(/\d+\./)
      .map(idea => idea.trim())
      .filter(idea => idea.length > 0);
      
    // If parsing fails, create fallback ideas
    if (ideas.length === 0) {
      ideas = [
        `Content idea about ${industry} trends`,
        `How-to guide for ${industry} beginners`,
        `Top 10 tips for success in ${industry}`,
        `Case study: Success story in ${industry}`,
        `Future of ${industry}: predictions and insights`
      ];
    }
      
    return ideas.slice(0, count);
  } catch (error) {
    console.error("Error generating content ideas:", error);
    // Return some default ideas instead of throwing an error
    return [
      `Content idea about ${industry} trends`,
      `How-to guide for ${industry} beginners`,
      `Top 10 tips for success in ${industry}`,
      `Case study: Success story in ${industry}`,
      `Future of ${industry}: predictions and insights`
    ];
  }
} 