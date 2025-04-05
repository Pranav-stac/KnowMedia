import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI with API key
// In production, use environment variables for API keys
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "AIzaSyAAaTyvPv33KC_KKBIz-GGr2l82oKg9Bhg";

// Fallback post content for different platforms
const FALLBACK_POSTS = {
  linkedin: "🚀 Professional Growth Tip:\n\nInvest in continuous learning and building your network. The most successful professionals are those who combine expertise with strong relationships.\n\n#ProfessionalDevelopment #CareerTips #LinkedInLearning",
  instagram: "✨ Embracing the journey of constant improvement! Every day is a new opportunity to become a better version of yourself.\n\n#SelfImprovement #Growth #Motivation #JourneyToSuccess",
  default: "Great content is about providing value to your audience. Whether educating, entertaining, or inspiring, make sure every post has a clear purpose and speaks directly to your followers' needs and interests."
};

/**
 * Generate text content using Google's Gemini API
 * @param {string} prompt - The text prompt to generate content from
 * @param {string} context - Optional context to guide the generation
 * @returns {Promise<string>} - The generated text
 */
export async function generateText(prompt, context = "") {
  console.log("generateText called with prompt:", prompt);
  console.log("Context:", context);
  
  try {
    const finalPrompt = context ? `${context}\n\n${prompt}` : prompt;
    console.log("Final prompt:", finalPrompt);
    
    // Try the API call first
    try {
      console.log("Attempting API call to Gemini");
      // Use gemini-1.5-flash model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: finalPrompt
                  }
                ]
              }
            ]
          })
        }
      );

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", JSON.stringify(data).substring(0, 200) + "...");
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter(part => part.text)
          .map(part => part.text)
          .join('\n');
        
        if (textParts.trim() !== '') {
          console.log("Successfully generated text from API");
          return textParts;
        }
      }
      
      // If we get here, we got a response but it didn't have the expected structure
      console.warn("API response missing expected data structure");
      throw new Error("Invalid response format from API");
    } catch (apiError) {
      console.warn("API call failed, using fallback content:", apiError);
      // Fall through to mock responses
    }
    
    // Determine what kind of content is being requested
    const promptLower = prompt.toLowerCase();
    console.log("Using fallback content generation based on prompt type");
    
    // Generate appropriate fallback content
    if (promptLower.includes('post about') || promptLower.includes('write post')) {
      let platform = 'default';
      if (promptLower.includes('linkedin')) platform = 'linkedin';
      if (promptLower.includes('instagram')) platform = 'instagram';
      
      // Extract topic if possible
      let topic = '';
      if (promptLower.includes('about')) {
        topic = prompt.split('about').pop().trim();
      }
      
      console.log("Using fallback post for platform:", platform, "with topic:", topic);
      return FALLBACK_POSTS[platform].replace('#', `#${topic.replace(/\s+/g, '')} #`);
    } else if (promptLower.includes('content ideas') || promptLower.includes('suggest ideas')) {
      // Extract industry if possible
      let industry = 'your industry';
      if (promptLower.includes('for')) {
        industry = prompt.split('for').pop().trim();
      }
      
      console.log("Generating fallback content ideas for industry:", industry);
      return `Here are some content ideas for ${industry}:\n\n1. Behind-the-scenes look at your process\n2. Customer success stories and testimonials\n3. Industry trends and statistics\n4. Tips and how-to guides\n5. Team member spotlights`;
    } else if (promptLower.includes('analytics') || promptLower.includes('insights')) {
      console.log("Generating fallback analytics content");
      return "# Content Performance Insights\n\n## Top Performing Content\n- Posts with images perform 2.3x better than text-only\n- Engagement peaks on Wednesday and Thursday\n- Posts about industry trends get the most shares\n\n## Recommendations\n- Focus on visual content\n- Schedule posts for mid-week\n- Create more content about industry trends and best practices";
    } else {
      // Generic social media response
      console.log("Generating generic fallback content");
      return "Creating engaging social media content requires understanding your audience, being consistent with your brand voice, and providing value. Mix different content types like educational, entertaining, and inspirational to keep your audience engaged.";
    }
  } catch (error) {
    console.error("Error generating text with AI:", error);
    // Return a mock response when in development to avoid breaking the UI
    return `Here's some content to help you with ${prompt}:\n\nCreating valuable content for your audience is key to social media success. Focus on solving problems, answering questions, or entertaining your followers.`;
  }
}

/**
 * Generate an image using the API
 * @param {string} prompt - The text prompt to generate an image from
 * @returns {Promise<string>} - The generated image data URL
 */
export async function generateImage(prompt) {
  console.log("generateImage called with prompt:", prompt);
  
  try {
    // Try the API endpoint for image generation
    try {
      console.log("Attempting API call for image generation");
      const response = await fetch("https://pranavai.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
      });
      
      console.log("Image API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Image API response:", JSON.stringify(result).substring(0, 200) + "...");
      
      if (result.images && result.images.length > 0 && result.images[0].url) {
        console.log("Successfully generated image from API");
        return result.images[0].url;
      }
      
      console.warn("No valid image URL in response");
      throw new Error("No valid image URL in response");
    } catch (apiError) {
      console.warn("API image generation failed, using fallback:", apiError);
      // Fall through to fallbacks
    }
    
    // Use appropriate fallback based on prompt
    const promptLower = prompt.toLowerCase();
    console.log("Using fallback image based on prompt type");
    
    if (promptLower.includes('nature') || promptLower.includes('landscape')) {
      console.log("Using nature/landscape fallback image");
      return 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
    } else if (promptLower.includes('city') || promptLower.includes('urban')) {
      console.log("Using city/urban fallback image");
      return 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
    } else if (promptLower.includes('office') || promptLower.includes('work')) {
      console.log("Using office/work fallback image");
      return 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
    } else if (promptLower.includes('food')) {
      console.log("Using food fallback image");
      return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80';
    } else {
      console.log("Using generic fallback image");
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
  console.log("generateSocialMediaPost called with:", { topic, platform, tone });
  
  try {
    const prompt = `Write a social media post about ${topic} for ${platform}. Use a ${tone} tone.`;
    return await generateText(prompt);
  } catch (error) {
    console.error("Error generating social media post:", error);
    
    // Use platform-specific fallback
    console.log("Using platform-specific fallback for:", platform);
    if (platform === 'linkedin') {
      return `📊 Professional insights on ${topic}:\n\nStaying updated with the latest trends in this field can give you a competitive edge. Continuous learning and adaptation are key to success.\n\n#${topic.replace(/\s+/g, '')} #ProfessionalDevelopment`;
    } else if (platform === 'instagram') {
      return `✨ Exploring ${topic} today and loving the journey!\n\nWhat's your experience with this? Drop your thoughts below 👇\n\n#${topic.replace(/\s+/g, '')} #ShareYourJourney`;
    } else {
      return `Here's a sample ${platform} post about ${topic}:\n\nExcited to share my thoughts on ${topic}! This is an area with so much potential for growth and innovation. What are your experiences?`;
    }
  }
}

/**
 * Generate content ideas using AI
 * @param {string} industry - The industry or niche
 * @param {number} count - Number of ideas to generate
 * @returns {Promise<string[]>} - Array of content ideas
 */
export async function generateContentIdeas(industry, count = 5) {
  console.log("generateContentIdeas called with industry:", industry, "count:", count);
  
  try {
    const prompt = `Generate ${count} content ideas for ${industry} that would perform well on social media.`;
    const text = await generateText(prompt);
    
    // Split the text into an array of ideas
    let ideas = text.split(/\d+\./)
      .map(idea => idea.trim())
      .filter(idea => idea.length > 0);
      
    console.log("Generated ideas count:", ideas.length);
    
    // If parsing fails, create fallback ideas
    if (ideas.length === 0) {
      console.log("Parsing failed, using fallback ideas");
      ideas = [
        `Latest trends in ${industry} that are transforming the market`,
        `Behind-the-scenes look at how ${industry} professionals work`,
        `Top 10 common mistakes to avoid in ${industry}`,
        `How AI and technology are changing ${industry}`,
        `Success story: How a small ${industry} business achieved remarkable growth`,
        `Interview with a ${industry} expert: Key insights and advice`,
        `The future of ${industry}: Predictions and opportunities`,
        `Ultimate beginner's guide to understanding ${industry}`
      ];
    }
      
    return ideas.slice(0, count);
  } catch (error) {
    console.error("Error generating content ideas:", error);
    // Return industry-specific default ideas
    console.log("Using fallback content ideas for industry:", industry);
    return [
      `Latest trends in ${industry} that are transforming the market`,
      `Behind-the-scenes look at how ${industry} professionals work`,
      `Top 10 common mistakes to avoid in ${industry}`,
      `How AI and technology are changing ${industry}`,
      `Success story: How a small ${industry} business achieved remarkable growth`
    ].slice(0, count);
  }
}

export const analyzeImage = async (imageFile) => {
  console.log("analyzeImage called with image type:", typeof imageFile);
  
  try {
    // Convert base64 to blob if needed
    let imageBlob;
    if (typeof imageFile === 'string' && imageFile.startsWith('data:')) {
      console.log("Converting base64 image to blob");
      const response = await fetch(imageFile);
      imageBlob = await response.blob();
    } else if (imageFile instanceof File) {
      console.log("Using File object directly");
      imageBlob = imageFile;
    } else {
      console.error("Invalid image format:", typeof imageFile);
      throw new Error("Invalid image format");
    }

    console.log("Image blob size:", imageBlob.size, "type:", imageBlob.type);

    // Initialize the model
    console.log("Initializing Gemini Pro Vision model");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Convert blob to base64 for the model
    console.log("Converting blob to base64 for model input");
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(imageBlob);
    });

    console.log("Base64 image length:", base64Image.length);

    // Generate content based on the image
    console.log("Calling Gemini Pro Vision to analyze image");
    const result = await model.generateContent([
      "Analyze this image and generate social media post content. Include: 1) A catchy title 2) An engaging description 3) 5 relevant hashtags. Format the response as JSON with fields: title, description, hashtags (array)",
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: imageBlob.type
        }
      }
    ]);

    const analysis = result.response.text();
    console.log("Analysis result:", analysis.substring(0, 200) + "...");
    
    try {
      console.log("Attempting to parse analysis as JSON");
      return JSON.parse(analysis);
    } catch (parseError) {
      // If JSON parsing fails, return a structured fallback
      console.warn("JSON parsing failed:", parseError);
      console.log("Using structured fallback with analysis text");
      return {
        title: "Engaging Visual Content",
        description: analysis || "Check out this amazing visual content! What are your thoughts?",
        hashtags: ["content", "social", "engagement", "visual", "trending"]
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Return a fallback response instead of throwing
    console.log("Using complete fallback response for image analysis");
    return {
      title: "Visual Content Share",
      description: "Excited to share this visual content with you! Let me know what you think in the comments below.",
      hashtags: ["content", "social", "sharing", "community", "engagement"]
    };
  }
}; 