from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from datetime import datetime

class SummaryItemSchema(BaseModel):
    original_text: str
    summary_text: str
    parameters: Dict
    created_at: datetime

class ChatSessionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, example="Research on AI Ethics")

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    summaries: List[SummaryItemSchema]
    created_at: datetime
    updated_at: datetime
    meta_summary: Optional[str] = None

class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=100, example="Long text to summarize...")
    session_id: int = Field(..., ge=0, example=1)
    parameters: Dict = Field(..., example={"min_length": 50, "max_length": 200, "do_sample": False})
    
    @validator('text')
    def text_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class SummaryResponse(BaseModel):
    session_id: int
    summary_index: int
    original_text: str
    summary_text: str
    parameters: Dict
    created_at: datetime

class MetaSummaryRequest(BaseModel):
    session_id: int = Field(..., ge=0, example=1)
    parameters: Optional[Dict] = Field(None, example={"min_length": 100, "max_length": 300})

class MetaSummaryResponse(BaseModel):
    session_id: int
    title: str
    meta_summary: str
    created_at: datetime 