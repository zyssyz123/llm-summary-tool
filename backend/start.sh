#!/bin/bash

# Load environment variables (if .env file exists)
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  # Set default environment variables
  echo "Using default environment variables..."
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_content_assistant"
  export JWT_SECRET="homework"
  export JWT_ALGORITHM="HS256"
  export ACCESS_TOKEN_EXPIRE_MINUTES="60"
  # Note: OPENAI_API_KEY should be set in environment variables or .env file
  export APP_NAME="AI Content Assistant"
  export ENVIRONMENT="development"
  export ALLOWED_ORIGINS="http://localhost:3000"
fi

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Warning: OPENAI_API_KEY is not set. Some features may not work properly."
  echo "Please set OPENAI_API_KEY in environment variables or .env file."
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start backend server
echo "Starting backend server..."
python run.py