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

function App() {
  const [inputs, setInputs] = useState<StoryInputs>({
    mainCharacter: '',
    setting: '',
    theme: ''
  });
  const [story, setStory] = useState<string>('');
  const [storyImage, setStoryImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const storyRef = useRef<HTMLDivElement>(null);
  const [html2pdfLoaded, setHtml2pdfLoaded] = useState<boolean>(false);

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

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: value })
  }

  const handleGenerateStory = async () => {
    if (!inputs.theme || !inputs.mainCharacter || !inputs.setting) return;
    
    // Clear previous story content
    setStory('');
    setStoryImage('');
    setError('');
    
    setIsLoading(true);
    setIsGeneratingImage(false);
    
    try {
      console.log('Starting story generation...');
      const story = await generateStoryWithOllama(inputs);
      
      console.log('Story generated successfully:', story.substring(0, 100) + '...');
      setStory(story);
      
      // Generate image based on the story content
      console.log('Starting image generation...');
      setIsGeneratingImage(true);
      try {
        const imageUrl = await generateStoryImage(story, inputs.theme);
        console.log('Image generated successfully. URL type:', typeof imageUrl);
        console.log('Image URL starts with:', imageUrl.substring(0, 50));
        setStoryImage(imageUrl);
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        setError('Failed to generate image. Using fallback image.');
        setStoryImage(getFallbackImage(inputs.theme));
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
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
      <h1 className="title">Silly Story Time</h1>
      <p className="subtitle">Create your own funny adventure!</p>
      
      <div className="form-container">
        <div className="input-group">
          <label htmlFor="mainCharacter">Who is the main character?</label>
          <input
            type="text"
            id="mainCharacter"
            value={inputs.mainCharacter}
            onChange={(e) => handleInputChange('mainCharacter', e.target.value)}
            placeholder="Enter a character name"
          />
        </div>

        <div className="input-group">
          <label htmlFor="setting">Where does the story take place?</label>
          <input
            type="text"
            id="setting"
            value={inputs.setting}
            onChange={(e) => handleInputChange('setting', e.target.value)}
            placeholder="Enter a setting"
          />
        </div>

        <div className="input-group">
          <label>Choose a theme for your story:</label>
          <div className="theme-grid">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-button ${inputs.theme === theme.id ? 'selected' : ''}`}
                onClick={() => handleInputChange('theme', theme.id)}
              >
                <span className="theme-emoji">{theme.emoji}</span>
                <span className="theme-label">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="generate-button"
          onClick={handleGenerateStory}
          disabled={!inputs.mainCharacter || !inputs.setting || !inputs.theme || isLoading || isGeneratingImage}
        >
          {isLoading ? 'Creating Silly Story...' : isGeneratingImage ? 'Creating Illustration...' : 'Generate Silly Story'}
        </button>

        {error && <p className="error-message">{error}</p>}

        {isLoading && <LoadingAnimation />}

        {/* Story Display */}
        {story && (
          <div className="story-container">
            <div id="story-content" className="story-content">
              <div className="story-header">
                <h1>{inputs.mainCharacter}'s Magical Story</h1>
                <p className="story-theme">Theme: {inputs.theme}</p>
              </div>
              
              {isGeneratingImage ? (
                <div className="image-loading-container">
                  <p className="image-loading-message">Creating a magical illustration...</p>
                  <div className="image-loading-spinner">
                    <span className="image-loading-emoji">🎨</span>
                    <span className="image-loading-emoji">🖌️</span>
                    <span className="image-loading-emoji">✨</span>
                  </div>
                </div>
              ) : storyImage && (
                <div className="story-image-container">
                  <img 
                    src={storyImage} 
                    alt="Story illustration" 
                    className="story-image"
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage(inputs.theme);
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
                <p>Created with ❤️ for {inputs.mainCharacter}</p>
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
