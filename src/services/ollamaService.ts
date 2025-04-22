interface StoryInputs {
  mainCharacter: string;
  setting: string;
  theme: string;
}

export const generateStoryWithOllama = async (inputs: StoryInputs): Promise<string> => {
  try {
    const prompt = `Create a short, funny children's story (max 150 words) with the following elements:
    - Main character: ${inputs.mainCharacter}
    - Setting: ${inputs.setting}
    - Theme: ${inputs.theme}
    
    The story should be silly, humorous, and appropriate for children. Include funny dialogue, silly situations, and a clear beginning, middle, and end. Make it entertaining and lighthearted.`;

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

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating story with Ollama:', error);
    // Fallback to a simple story if the API call fails
    return `Once upon a time, there was a ${inputs.mainCharacter} who lived in ${inputs.setting}. 
    They had a funny adventure related to ${inputs.theme}. Everyone laughed and had a great time! 
    The end.`;
  }
}; 