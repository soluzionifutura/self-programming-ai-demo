# self-programming-ai-demo

## Description

The ai-bot project is a Node.js application designed for interacting with the OpenAI API. It features dynamic handling of various AI functions and maintains a history of chat completions.

## Setup and Installation

1. **Environment Setup**: Ensure Node.js is installed on your system.
2. **Clone the Repository**: Clone this project to your local machine.
3. **Install Dependencies**: Run `npm install` to install required dependencies.

## Configuration

- **Environment Variables**:
  - Copy the `.env-sample` file in the root directory and rename it to `.env`.
  - In the `.env` file, set `OPENAI_KEY` with your OpenAI API key.

## Running the Application

- **Run the application**: For testing, execute `npm start -- "your prompt"`, replacing `"your prompt"` with your 	test input.
- **Development Mode**: For development, use `npm run dev`, which employs `nodemon` for hot reloading.

## Project Structure

- **Core Functionality**: Located in `./core-ai-fn`.
- **Generated AI Functions**: Found in `../generated-ai-fns`.
- **History Management**: Chat history is stored in `history.json`.

## Features

- **Dynamic Function Handling**: Supports core and generated AI functions.
- **Chat History**: Maintains a record of chat completions for context in ongoing conversations.
