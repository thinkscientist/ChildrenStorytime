import { StoryInputs } from '../types';
import { config } from '../config';

// This function will generate an image based on the story content
export const generateStoryImage = async (story: string, theme: string): Promise<string> => {
  try {
    // Create a prompt based on the story content
    const prompt = createImagePrompt(story, theme);
    console.log('Generated image prompt:', prompt);
    
    // Call the Stable Diffusion API
    return await callStableDiffusionAPI(prompt);
  } catch (error) {
    console.error('Error in generateStoryImage:', error);
    // Return a fallback image if the API call fails
    return getFallbackImage(theme);
  }
};

// Create a prompt for the image generation API based on the story content
const createImagePrompt = (story: string, theme: string): string => {
  // Extract the first few sentences to get the main scene
  const firstParagraph = story.split('\n')[0];
  
  // Create a child-friendly, colorful prompt
  return `A colorful, child-friendly illustration for a children's story about ${theme}. 
  The scene should be bright, cheerful, and suitable for children under 10. 
  Style: cartoon, vibrant colors, simple shapes, no scary elements. 
  Scene: ${firstParagraph.substring(0, 100)}...`;
};

// Call the Stable Diffusion API
const callStableDiffusionAPI = async (prompt: string): Promise<string> => {
  // Get the API key from the config
  const API_KEY = config.stabilityApiKey;
  
  console.log('Starting Stable Diffusion API call...');
  console.log('API Key available:', config.hasStabilityApiKey);
  console.log('API Key length:', API_KEY?.length || 0);
  
  if (!API_KEY) {
    console.error('Stability API key is missing. Please add it to your environment variables.');
    throw new Error('API key missing');
  }
  
  try {
    console.log('Making API request to Stability AI with prompt:', prompt);
    const requestBody = {
      text_prompts: [
        {
          text: prompt,
          weight: 1
        },
        {
          text: "scary, dark, violent, inappropriate for children, realistic, photorealistic, 3D render, CGI",
          weight: -1
        }
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
    };
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('API response received. Response keys:', Object.keys(responseData));
    
    // The API returns base64 encoded images
    if (responseData.artifacts && responseData.artifacts.length > 0) {
      const imageData = responseData.artifacts[0].base64;
      console.log('Base64 image data length:', imageData.length);
      console.log('First 100 characters of base64 data:', imageData.substring(0, 100));
      return `data:image/png;base64,${imageData}`;
    } else {
      console.error('No image data in response:', responseData);
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Error calling Stability API:', error);
    console.log('Falling back to Unsplash API...');
    return callUnsplashAPI(prompt);
  }
};

// Get a fallback image based on the theme
const getFallbackImage = (theme: string): string => {
  const themeImages: Record<string, string> = {
    'friendship': 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop',
    'adventure': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    'magic': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
    'animals': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&h=600&fit=crop',
    'space': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop',
    'ocean': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    'forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    'school': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
  };
  
  return themeImages[theme] || 'https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=800&h=600&fit=crop';
};

// Fallback to Unsplash API
const callUnsplashAPI = async (prompt: string): Promise<string> => {
  try {
    console.log('Making API request to Unsplash...');
    
    // Extract keywords from the prompt
    const keywords = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(',');
    
    console.log('Unsplash search keywords:', keywords);
    
    // Use a static Unsplash image instead of the random API
    const imageUrl = `https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=800&h=600&fit=crop&q=${encodeURIComponent(keywords)}`;
    console.log('Using static Unsplash image:', imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error with Unsplash fallback:', error);
    // Return a default static image if everything fails
    return 'https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=800&h=600&fit=crop';
  }
}; 