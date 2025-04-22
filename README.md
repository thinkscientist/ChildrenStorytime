# Silly Story Time

A fun, interactive web application that generates silly stories for children with AI-generated illustrations.

## Features

- Generate fun, age-appropriate stories for children under 10
- Create custom stories with your own characters and settings
- Choose from various themes like friendship, adventure, magic, and more
- Get AI-generated illustrations that match your story
- Enjoy playful animations and a child-friendly interface

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An API key from Stability AI for image generation

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/children-storytime.git
   cd children-storytime
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   - Copy the `.env.example` file to `.env`
   - Get an API key from [Stability AI](https://stability.ai/)
   - Add your API key to the `.env` file:
     ```
     REACT_APP_STABILITY_API_KEY=your_api_key_here
     ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. Enter a main character name (e.g., "Fluffy the Dragon")
2. Specify a setting (e.g., "Candy Land")
3. Choose a theme by clicking on one of the theme icons
4. Click "Generate Silly Story" to create your story
5. Wait for the story and illustration to be generated
6. Enjoy your silly story!

## Technologies Used

- React
- TypeScript
- Ollama for story generation
- Stability AI API for image generation
- CSS animations for a playful user experience

## License

MIT

## Acknowledgements

- Ollama for providing the language model
- Stability AI for the image generation API
- All the emojis and fun elements that make this app special!
