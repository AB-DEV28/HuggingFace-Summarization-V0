from beanie import Document
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional, List

class SummaryItem(BaseModel):
    original_text: str
    summary_text: str
    parameters: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    title: str
    summaries: List[SummaryItem] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    meta_summary: Optional[str] = None  # Summary of all summaries in the chat

class User(Document):
    email: EmailStr = Field(unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    chat_sessions: List[ChatSession] = Field(default_factory=list)

    class Settings:
        name = "users"
        use_state_management = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class SummaryParameters(BaseModel):
    min_length: int = Field(50, ge=10, le=1000)
    max_length: int = Field(250, ge=50, le=1000)
    do_sample: bool = False
    
    @validator('max_length')
    def validate_max_length(cls, v, values):
        if 'min_length' in values and v <= values['min_length']:
            raise ValueError('max_length must be greater than min_length')
        return v