interface StoryInputs {
  mainCharacter: string;
  setting: string;
  theme: string;
}

export const generateStoryWithOllama = async (inputs: StoryInputs): Promise<string> => {
  try {
    console.log('Generating story with Ollama for:', inputs);
    
    const prompt = `Create a short, funny children's story (max 200 words) that is easy to read and understand for children under 10 years old. Use simple words and short sentences.

    - Main character: ${inputs.mainCharacter}
    - Setting: ${inputs.setting}
    - Theme: ${inputs.theme}
    
    The story should:
    - Use simple words that a child under 10 can understand
    - Have short, clear sentences
    - Include lots of fun and silly moments
    - Be about 3-4 paragraphs long
    - Have a clear beginning, middle, and end
    - Include some dialogue to make it more engaging
    - Use repetition and simple patterns that children enjoy
    - Avoid scary or complex themes
    
    Make it extra silly and fun!`;

    console.log('Sending request to Ollama API...');
    console.log('Ollama API URL: http://localhost:11434/api/generate');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'granite3.3', // You can change this to any model you have in Ollama
        prompt: prompt,
        stream: false,
      }),
    });

    console.log('Ollama API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ollama API response received. Story length:', data.response?.length || 0);
    
    if (!data.response) {
      throw new Error('No story content received from Ollama API');
    }
    
    return data.response;
  } catch (error) {
    console.error('Error generating story with Ollama:', error);
    // Fallback to a simple story if the API call fails
    return `Once upon a time, there was a ${inputs.mainCharacter} who lived in ${inputs.setting}. 
    They had a funny adventure related to ${inputs.theme}. Everyone laughed and had a great time! 
    The end.`;
  }
}; 