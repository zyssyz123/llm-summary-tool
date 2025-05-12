import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.api import api_router
from app.core.config import PROJECT_NAME, API_V1_PREFIX, ALLOWED_ORIGINS
from app.db.database import Base, engine, get_db
from app.models import user, chat

# Create database tables (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=PROJECT_NAME,
    openapi_url=f"{API_V1_PREFIX}/openapi.json",
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=API_V1_PREFIX)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {PROJECT_NAME}"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# For development: Create a test user if not exists
@app.on_event("startup")
async def create_test_user():
    from app.core.security import get_password_hash, get_user_by_email
    from app.models.user import User
    
    # Only in development mode
    if os.getenv("ENVIRONMENT", "development") == "development":
        db = next(get_db())
        test_email = "test@example.com"
        
        # Check if test user exists
        user = get_user_by_email(db, test_email)
        
        if not user:
            # Create test user
            test_user = User(
                email=test_email,
                username="testuser",
                hashed_password=get_password_hash("password"),
                is_active=True,
            )
            
            db.add(test_user)
            db.commit()
            print(f"Created test user: {test_email}")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 