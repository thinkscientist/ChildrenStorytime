import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { generateStoryWithOllama } from './services/ollamaService'
import { generateStoryImage } from './services/imageService'
import { StoryInputs } from './types'
import { config } from './config'
import { generatePDF } from './services/pdfService'
import { exportAsImage } from './services/directImageExport'

// Helper function to get fallback images
const getFallbackImage = (theme: string): string => {
  // Use static fallback images instead of random Unsplash URLs
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

interface StoryRequest {
  childName: string;
  additionalChildren: string[];  // New field for additional children
  age: number;
  theme: string;
  moral: string;
  length: 'short' | 'medium' | 'long';
}

function App() {
  const [story, setStory] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [additionalChildren, setAdditionalChildren] = useState<string[]>(['']); // New state for additional children
  const [age, setAge] = useState<number>(5);
  const [selectedTheme, setSelectedTheme] = useState(''); // Renamed from theme to selectedTheme
  const [moral, setMoral] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const storyRef = useRef<HTMLDivElement>(null);
  const [html2pdfLoaded, setHtml2pdfLoaded] = useState<boolean>(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean>(false);

  // Load html2pdf.js from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => {
      console.log('html2pdf.js loaded successfully');
      setHtml2pdfLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load html2pdf.js');
      setError('Failed to load PDF generation library. Please try again later.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load html2canvas from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    script.onload = () => {
      console.log('html2canvas loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load html2canvas:', error);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Log environment variables on startup
  useEffect(() => {
    console.log('App started, checking environment variables...');
    config.logEnvironment();
    
    // Test image generation if API key is available
    if (config.hasStabilityApiKey) {
      console.log('API key available, testing image generation...');
      testImageGeneration();
    } else {
      console.warn('No API key available, image generation will not work');
    }
  }, []);

  // Test function to directly test image generation
  const testImageGeneration = async () => {
    try {
      console.log('Testing image generation with a simple prompt...');
      const testInputs: StoryInputs = {
        mainCharacter: 'Test Character',
        setting: 'Test Setting',
        theme: 'magic'
      };
      const testStory = 'This is a test story about a magical adventure.';
      
      const imageUrl = await generateStoryImage(testStory, testInputs.theme);
      console.log('Test image generation result:', imageUrl.substring(0, 50) + '...');
    } catch (error) {
      console.error('Test image generation failed:', error);
    }
  };

  // Check if Ollama is available
  useEffect(() => {
    const checkOllamaAvailability = async () => {
      try {
        console.log('Checking if Ollama is available...');
        const response = await fetch('http://localhost:11434/api/tags', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Ollama is available!');
          setOllamaAvailable(true);
        } else {
          console.warn('Ollama is not available. Status:', response.status);
          setOllamaAvailable(false);
        }
      } catch (error) {
        console.warn('Ollama is not available. Error:', error);
        setOllamaAvailable(false);
      }
    };
    
    checkOllamaAvailability();
  }, []);

  const themes = [
    { id: 'friendship', emoji: '🤝', label: 'Best Buddies Forever!' },
    { id: 'adventure', emoji: '🗺️', label: 'Let\'s Go Exploring!' },
    { id: 'magic', emoji: '✨', label: 'Magical Surprises!' },
    { id: 'animals', emoji: '🐾', label: 'Furry Friends Fun!' },
    { id: 'space', emoji: '🚀', label: 'Zoom to the Stars!' },
    { id: 'ocean', emoji: '🌊', label: 'Splashy Sea Fun!' },
    { id: 'forest', emoji: '🌳', label: 'Woodland Wonders!' },
    { id: 'school', emoji: '🏫', label: 'Learning is Fun!' }
  ];

  const handleAddChild = () => {
    setAdditionalChildren([...additionalChildren, '']);
  };

  const handleRemoveChild = (index: number) => {
    setAdditionalChildren(additionalChildren.filter((_, i) => i !== index));
  };

  const handleAdditionalChildChange = (index: number, value: string) => {
    const newChildren = [...additionalChildren];
    newChildren[index] = value;
    setAdditionalChildren(newChildren);
  };

  const handleGenerateStory = async () => {
    if (!childName.trim()) {
      setError('Please enter the main child\'s name');
      return;
    }

    // Filter out empty names from additional children
    const validAdditionalChildren = additionalChildren.filter(name => name.trim());

    setIsLoading(true);
    setError(null);
    setStory('');
    setImageUrl('');

    try {
      if (ollamaAvailable) {
        // Create inputs for Ollama service
        const inputs: StoryInputs = {
          mainCharacter: childName,
          setting: validAdditionalChildren.length > 0 
            ? `with ${validAdditionalChildren.join(', ')}` 
            : 'in a magical place',
          theme: selectedTheme
        };

        // Generate story using Ollama
        const generatedStory = await generateStoryWithOllama(inputs);
        
        // Generate image based on the story content
        const imageUrl = await generateStoryImage(generatedStory, selectedTheme);
        
        setStory(generatedStory);
        setImageUrl(imageUrl);
      } else {
        // Use mock story if Ollama is not available
        console.log('Ollama is not available, using mock story');
        const mockStory = generateMockStory(childName, validAdditionalChildren, selectedTheme, age, moral, length);
        const mockImageUrl = getFallbackImage(selectedTheme);
        
        setStory(mockStory);
        setImageUrl(mockImageUrl);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
      
      // Fallback to mock story if Ollama fails
      const mockStory = generateMockStory(childName, validAdditionalChildren, selectedTheme, age, moral, length);
      const mockImageUrl = getFallbackImage(selectedTheme);
      
      setStory(mockStory);
      setImageUrl(mockImageUrl);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock story generation function
  const generateMockStory = (
    childName: string, 
    additionalChildren: string[], 
    theme: string, 
    age: number, 
    moral: string, 
    length: 'short' | 'medium' | 'long'
  ): string => {
    // Create a list of all children
    const allChildren = [childName, ...additionalChildren];
    const childrenList = allChildren.length > 1 
      ? `${allChildren.slice(0, -1).join(', ')} and ${allChildren[allChildren.length - 1]}`
      : childName;
    
    // Theme descriptions
    const themeDescriptions: Record<string, string> = {
      'friendship': 'learning about friendship and working together',
      'adventure': 'going on an exciting adventure',
      'magic': 'discovering magical powers',
      'animals': 'meeting talking animals',
      'space': 'exploring the stars and planets',
      'ocean': 'swimming with sea creatures',
      'forest': 'exploring a magical forest',
      'school': 'having fun at school'
    };
    
    const themeDescription = themeDescriptions[theme] || 'having a wonderful time';
    
    // Generate a story based on the inputs
    if (additionalChildren.length > 0) {
      return `Once upon a time, ${childrenList} were ${themeDescription}. 

${childName} had just turned ${age} years old and was excited to celebrate with their friends.

As they ${themeDescription}, they learned an important lesson about ${moral || 'being kind to others'}. 

${additionalChildren[0]} had an idea to make the day even more special, and ${additionalChildren.length > 1 ? `${additionalChildren[1]} helped put the plan into action.` : 'everyone helped put the plan into action.'}

They all worked together and had the most amazing time! The end.`;
    } else {
      return `Once upon a time, ${childName} was ${themeDescription}. 

${childName} had just turned ${age} years old and was excited to celebrate with everyone.

As ${childName} ${themeDescription}, they learned an important lesson about ${moral || 'being kind to others'}. 

${childName} had an idea to make the day even more special.

Everyone worked together and had the most amazing time! The end.`;
    }
  };

  const handleExportImage = async () => {
    const storyContent = document.getElementById('story-content');
    if (!storyContent) {
      console.error('Story content element not found');
      return;
    }
    
    try {
      await exportAsImage(storyContent);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  const LoadingAnimation = () => {
    const loadingMessages = [
      "Gathering silly ideas...",
      "Making the story extra funny...",
      "Adding some wacky characters...",
      "Sprinkling in some giggles...",
      "Almost ready to make you laugh..."
    ];
    
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    
    return (
      <div className="loading-container">
        <p className="loading-message">{randomMessage}</p>
        <div className="loading-spinner">
          <span className="loading-emoji">🦄</span>
          <span className="loading-emoji">🌈</span>
          <span className="loading-emoji">🎈</span>
          <span className="loading-emoji">🎪</span>
          <span className="loading-emoji">🎨</span>
        </div>
        <p className="loading-tip">Fun fact: The average child laughs 300 times a day!</p>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          {Array.from("Silly Story Time").map((letter, index) => (
            <span key={index}>{letter}</span>
          ))}
        </h1>
        <p>Create magical stories with AI! ✨</p>
      </header>
      <p className="subtitle">Create your own funny adventure!</p>
      
      <div className="form-container">
        <div className="input-group">
          <label htmlFor="childName">Main Child's Name:</label>
          <input
            type="text"
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Enter the main child's name"
          />
        </div>

        <div className="additional-children">
          <label>Additional Children (Optional):</label>
          {additionalChildren.map((name, index) => (
            <div key={index} className="additional-child-input">
              <input
                type="text"
                value={name}
                onChange={(e) => handleAdditionalChildChange(index, e.target.value)}
                placeholder={`Enter child ${index + 2}'s name`}
              />
              {index > 0 && (
                <button 
                  className="remove-child-btn"
                  onClick={() => handleRemoveChild(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button 
            className="add-child-btn"
            onClick={handleAddChild}
          >
            + Add Another Child
          </button>
        </div>

        <div className="input-group">
          <label>Choose a theme for your story:</label>
          <div className="theme-grid">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                className={`theme-button ${selectedTheme === themeOption.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(themeOption.id)}
              >
                <span className="theme-emoji">{themeOption.emoji}</span>
                <span className="theme-label">{themeOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="generate-button"
          onClick={handleGenerateStory}
          disabled={!childName || !selectedTheme || isLoading}
        >
          {isLoading ? 'Creating Silly Story...' : 'Generate Silly Story'}
        </button>

        {error && <p className="error-message">{error}</p>}

        {isLoading && <LoadingAnimation />}

        {/* Story Display */}
        {story && (
          <div className="story-container">
            <div id="story-content" className="story-content">
              <div className="story-header">
                <h1>{additionalChildren.some(name => name.trim() !== '') ? "Our Magical Story" : `${childName}'s Magical Story`}</h1>
                <p className="story-theme">
                  {additionalChildren.some(name => name.trim() !== '') 
                    ? `Featuring ${childName} and ${additionalChildren.filter(name => name.trim() !== '').join(', ')}` 
                    : `Theme: ${selectedTheme}`}
                </p>
              </div>
              
              {imageUrl && (
                <div className="story-image-container">
                  <img 
                    src={imageUrl} 
                    alt="Story illustration" 
                    className="story-image"
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage(selectedTheme);
                    }}
                  />
                </div>
              )}
              
              <div className="story-text">
                {story.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              <div className="story-footer">
                <p>Created with ❤️ for {additionalChildren.some(name => name.trim() !== '') 
                  ? `${childName} and ${additionalChildren.filter(name => name.trim() !== '').join(', ')}` 
                  : childName}</p>
                <p>Powered By IBM Granite 3.3 & Stable Diffusion</p>
              </div>
            </div>
            <div className="export-container">
              <button 
                onClick={handleExportImage}
                className="export-button"
                disabled={!story}
              >
                Save as Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
