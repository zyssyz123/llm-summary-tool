# AI Content Assistant

An AI-powered application for processing, summarizing, and interacting with various types of content. Upload text or PDFs, extract key insights, and engage in question-answering with your documents.

## Features

- **Multiple Input Types**: Support for text, PDF uploads, and URLs
- **AI Processing**: Automatic summarization and key point extraction
- **Interactive Q&A**: Ask follow-up questions about your content
- **User Management**: Register, login, and view chat history
- **Cloud Deployable**: Ready for deployment to AWS, GCP, or other cloud providers

## Tech Stack

### Frontend
- React with TypeScript
- Chakra UI for interface components
- Redux Toolkit for state management
- Axios for API communication

### Backend
- Python FastAPI for the REST API
- SQLAlchemy ORM with PostgreSQL database
- LangChain for LLM integration
- PyJWT for authentication

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables.

5. Run the application:
   ```
   python run.py
   ```

   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   The application will be available at http://localhost:3000

## API Documentation

API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Deployment

The application is designed to be deployed to various cloud providers:

### AWS Deployment
1. Frontend: Deploy to S3 + CloudFront
2. Backend: Deploy using Elastic Beanstalk or ECS
3. Database: Use RDS PostgreSQL
4. File Storage: S3 for uploaded files

### Other Cloud Options
- GCP: Cloud Run for backend, Cloud SQL for database
- Azure: App Service for backend, Azure SQL for database
- Vercel/Netlify for frontend, with a separate backend deployment

## Monitoring

The backend includes basic monitoring endpoints to track:
- API request volume
- Response times
- Error rates
- User activity 