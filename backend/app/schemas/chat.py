from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class MessageBase(BaseModel):
    content: str
    role: Literal["user", "assistant"]
    message_metadata: Optional[Dict[str, Any]] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    chat_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class ChatBase(BaseModel):
    title: str

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[Message] = []
    
    class Config:
        orm_mode = True

class ChatSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    
    class Config:
        orm_mode = True

# Request models
class TextProcessRequest(BaseModel):
    text: str
    
class URLProcessRequest(BaseModel):
    url: str 