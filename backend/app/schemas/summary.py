from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Optional

class SummaryParameters(BaseModel):
    min_length: int = Field(50, ge=10, le=1000)
    max_length: int = Field(250, ge=50, le=1000)
    do_sample: bool = False

class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=100, example="Long text to summarize...")
    parameters: SummaryParameters

class SummaryResponse(BaseModel):
    original_text: str
    summary_text: str
    parameters: Dict
    created_at: datetime

class SummaryUpdateRequest(BaseModel):
    text: Optional[str] = Field(None, min_length=100)
    parameters: Optional[SummaryParameters] = None
