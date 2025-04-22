import React, { useState } from 'react'
import './App.css'
import { generateStoryWithOllama } from './services/ollamaService'

interface StoryInputs {
  mainCharacter: string;
  setting: string;
  theme: string;
}

function App() {
  const [inputs, setInputs] = useState<StoryInputs>({
    mainCharacter: '',
    setting: '',
    theme: ''
  });
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  const generateStory = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const newStory = await generateStoryWithOllama(inputs)
      setStory(newStory)
    } catch (err) {
      console.error('Error generating story:', err)
      setError('Failed to generate story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
          onClick={generateStory}
          disabled={!inputs.mainCharacter || !inputs.setting || !inputs.theme || isLoading}
        >
          {isLoading ? 'Creating Silly Story...' : 'Generate Silly Story'}
        </button>

        {error && <p className="error-message">{error}</p>}

        {isLoading && <LoadingAnimation />}

        {story && !isLoading && (
          <div className="story-container">
            <p className="story-text">{story}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
