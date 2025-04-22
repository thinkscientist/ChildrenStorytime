# Silly Story Generator

A colorful web application that generates short, funny children's stories using Ollama's LLM capabilities.

## Features

- Create silly, humorous children's stories with custom characters, settings, and themes
- Beautiful, playful UI with colorful design and fun animations
- Powered by Ollama's LLM for creative and entertaining story generation
- Responsive design that works on all devices

## Prerequisites

- Node.js (v14 or higher)
- Ollama installed and running locally

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure Ollama is installed and running on your machine
   - Download from [Ollama's website](https://ollama.ai/)
   - Run `ollama serve` to start the server
   - Pull a model (e.g., `ollama pull granite3.3`)

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## How to Use

1. Enter the main character's name
2. Describe where the story takes place
3. Select a fun theme from the dropdown (silly animals, magical mishaps, food adventures, etc.)
4. Click "Generate Silly Story" to create your funny tale
5. The generated story will appear below the form

## Customizing the Ollama Model

By default, the application uses the `granite3.3` model. To use a different model:

1. Open `src/services/ollamaService.ts`
2. Change the `model` parameter in the `generateStoryWithOllama` function to your preferred model
3. Make sure you have pulled that model using `ollama pull <model-name>`

## Troubleshooting

- If you see an error message, make sure Ollama is running and accessible at `http://localhost:11434`
- Check that you have the specified model installed in Ollama
- If the story generation fails, the application will fall back to a simple template-based story

## License

MIT
