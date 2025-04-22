import { useState } from 'react'
import './App.css'
import { generateStoryWithOllama } from './services/ollamaService'

function App() {
  const [inputs, setInputs] = useState({
    mainCharacter: '',
    setting: '',
    theme: '',
  })
  const [story, setStory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setInputs({ ...inputs, [field]: e.target.value })
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

  return (
    <div className="app-container">
      <h1 className="title">Silly Story Time</h1>
      <p className="subtitle">Create your own funny adventure!</p>
      
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="mainCharacter">Main Character</label>
          <input
            id="mainCharacter"
            type="text"
            placeholder="Enter the main character's name"
            value={inputs.mainCharacter}
            onChange={handleInputChange('mainCharacter')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="setting">Setting</label>
          <input
            id="setting"
            type="text"
            placeholder="Where does the story take place?"
            value={inputs.setting}
            onChange={handleInputChange('setting')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={inputs.theme}
            onChange={handleInputChange('theme')}
            required
          >
            <option value="">Select a theme</option>
            <option value="silly animals">Silly Animals</option>
            <option value="magical mishaps">Magical Mishaps</option>
            <option value="food adventures">Food Adventures</option>
            <option value="space silliness">Space Silliness</option>
            <option value="underwater fun">Underwater Fun</option>
          </select>
        </div>

        <button
          className="generate-button"
          onClick={generateStory}
          disabled={!inputs.mainCharacter || !inputs.setting || !inputs.theme || isLoading}
        >
          {isLoading ? 'Creating Silly Story...' : 'Generate Silly Story'}
        </button>

        {error && <p className="error-message">{error}</p>}

        {story && (
          <div className="story-container">
            <p className="story-text">{story}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
