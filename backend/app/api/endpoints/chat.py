from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.models.chat import Chat, Message
from app.schemas.chat import (
    Chat as ChatSchema,
    ChatCreate,
    ChatSummary,
    MessageCreate,
    Message as MessageSchema,
    TextProcessRequest,
    URLProcessRequest,
)
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/", response_model=List[ChatSummary])
async def get_chats(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all chats for current user.
    """
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(desc(Chat.updated_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Create ChatSummary objects
    result = []
    for chat in chats:
        message_count = db.query(Message).filter(Message.chat_id == chat.id).count()
        result.append(
            {
                "id": chat.id,
                "title": chat.title,
                "created_at": chat.created_at,
                "updated_at": chat.updated_at,
                "message_count": message_count
            }
        )
    
    return result

@router.post("/", response_model=ChatSchema)
async def create_chat(
    chat_in: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new chat.
    """
    chat = Chat(
        title=chat_in.title,
        user_id=current_user.id,
    )
    
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return chat

@router.get("/{chat_id}", response_model=ChatSchema)
async def get_chat(
    chat_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific chat by ID.
    """
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return chat

@router.post("/{chat_id}/messages", response_model=MessageSchema)
async def create_message(
    message_in: MessageCreate,
    chat_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Add a message to a chat.
    """
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Create user message
    message = Message(
        chat_id=chat.id,
        content=message_in.content,
        role=message_in.role,
        message_metadata=message_in.message_metadata,
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # If this is a user message, generate AI response
    if message.role == "user":
        # Get chat history for context
        chat_messages = (
            db.query(Message)
            .filter(Message.chat_id == chat.id)
            .order_by(Message.created_at)
            .all()
        )
        
        # Build context from previous messages
        context = "\n".join([f"{m.role}: {m.content}" for m in chat_messages])
        
        # Generate AI response
        response_data = await ai_service.answer_question(
            query=message.content, 
            context=context
        )
        
        if response_data["status"] == "success":
            # Extract content string from AIMessage object if needed
            answer_content = response_data["answer"]
            
            # If answer is an AIMessage object, extract its content
            if hasattr(response_data["answer"], "content"):
                answer_content = response_data["answer"].content
                
            # Create AI message
            ai_message = Message(
                chat_id=chat.id,
                content=answer_content,
                role="assistant",
            )
            
            db.add(ai_message)
            db.commit()
    
    # Update chat timestamp
    chat.updated_at = message.created_at
    db.commit()
    
    return message

@router.post("/process-text", response_model=dict)
async def process_text(
    text_request: TextProcessRequest,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Process text content and generate summary and key points.
    """
    result = await ai_service.process_text(text_request.text)
    return result

@router.post("/process-pdf", response_model=dict)
async def process_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Process PDF file and extract content for analysis.
    """
    # Read file content
    file_content = await file.read()
    
    # Process PDF
    result = await ai_service.process_pdf(file_content, file.filename)
    return result 