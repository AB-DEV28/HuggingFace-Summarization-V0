from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    SummaryRequest, 
    SummaryResponse,
    MetaSummaryRequest,
    MetaSummaryResponse,
    SummaryItemSchema
)
from app.services.chat_service import ChatService
from app.utils import get_current_user
from app.models import User
from app.crud import (
    get_chat_sessions,
    get_chat_session,
    delete_chat_session,
    update_chat_session_title,
    get_summary_from_chat,
    update_summary_in_chat,
    delete_summary_from_chat
)
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/sessions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    request: ChatSessionCreate,
    current_user: User = Depends(get_current_user)
):
    session_id = await ChatService.create_session(
        current_user, 
        request.title
    )
    return {
        "session_id": session_id,
        "message": "Chat session created successfully"
    }

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_all_chat_sessions(current_user: User = Depends(get_current_user)):
    sessions = await get_chat_sessions(current_user)
    return [
        ChatSessionResponse(
            id=i,
            title=session.title,
            summaries=[
                SummaryItemSchema(
                    original_text=summary.original_text,
                    summary_text=summary.summary_text,
                    parameters=summary.parameters,
                    created_at=summary.created_at
                ) for summary in session.summaries
            ],
            created_at=session.created_at,
            updated_at=session.updated_at,
            meta_summary=session.meta_summary
        ) 
        for i, session in enumerate(sessions)
    ]

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session_by_id(
    session_id: int,
    current_user: User = Depends(get_current_user)
):
    session = await get_chat_session(current_user, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return ChatSessionResponse(
        id=session_id,
        title=session.title,
        summaries=[
            SummaryItemSchema(
                original_text=summary.original_text,
                summary_text=summary.summary_text,
                parameters=summary.parameters,
                created_at=summary.created_at
            ) for summary in session.summaries
        ],
        created_at=session.created_at,
        updated_at=session.updated_at,
        meta_summary=session.meta_summary
    )

@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session_title_endpoint(
    session_id: int,
    title: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user)
):
    session = await get_chat_session(current_user, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    success = await update_chat_session_title(current_user, session_id, title)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update chat session title"
        )
    
    # Get updated session
    updated_session = await get_chat_session(current_user, session_id)
    
    return ChatSessionResponse(
        id=session_id,
        title=updated_session.title,
        summaries=[
            SummaryItemSchema(
                original_text=summary.original_text,
                summary_text=summary.summary_text,
                parameters=summary.parameters,
                created_at=summary.created_at
            ) for summary in updated_session.summaries
        ],
        created_at=updated_session.created_at,
        updated_at=updated_session.updated_at,
        meta_summary=updated_session.meta_summary
    )

@router.post("/summarize", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
async def add_summary_to_chat_session(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user)
):
    summary_index, summary_text = await ChatService.add_summary(
        current_user,
        request.session_id,
        request.text,
        request.parameters
    )
    
    return SummaryResponse(
        session_id=request.session_id,
        summary_index=summary_index,
        original_text=request.text,
        summary_text=summary_text,
        parameters=request.parameters,
        created_at=datetime.utcnow()
    )

@router.get("/sessions/{session_id}/summaries/{summary_index}", response_model=SummaryResponse)
async def get_summary_by_index(
    session_id: int,
    summary_index: int,
    current_user: User = Depends(get_current_user)
):
    summary = await get_summary_from_chat(current_user, session_id, summary_index)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    return SummaryResponse(
        session_id=session_id,
        summary_index=summary_index,
        original_text=summary.original_text,
        summary_text=summary.summary_text,
        parameters=summary.parameters,
        created_at=summary.created_at
    )

class PartialSummaryRequest(BaseModel):
    text: Optional[str] = Field(None, min_length=100, example="Long text to summarize...")
    parameters: Optional[Dict] = Field(None, example={"min_length": 50, "max_length": 200, "do_sample": False})

@router.patch("/sessions/{session_id}/summaries/{summary_index}", response_model=SummaryResponse)
async def update_summary(
    session_id: int,
    summary_index: int,
    request: PartialSummaryRequest,
    current_user: User = Depends(get_current_user)
):
    # Get existing summary
    existing_summary = await get_summary_from_chat(current_user, session_id, summary_index)
    if not existing_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )

    # Determine what to update
    text_to_use = request.text if request.text is not None else existing_summary.original_text
    parameters_to_use = request.parameters if request.parameters is not None else existing_summary.parameters

    # Generate new summary if either text or parameters changed
    if request.text is not None or request.parameters is not None:
        summary_index_new, summary_text = await ChatService.add_summary(
            current_user,
            session_id,
            text_to_use,
            parameters_to_use
        )
        
        # Update the existing summary with new content
        success = await update_summary_in_chat(
            current_user,
            session_id,
            summary_index,
            original_text=text_to_use,
            summary_text=summary_text,
            parameters=parameters_to_use
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update summary"
            )
        
        # Delete the temporary summary we created
        await delete_summary_from_chat(current_user, session_id, summary_index_new)
    
    # Get updated summary
    updated_summary = await get_summary_from_chat(current_user, session_id, summary_index)
    
    return SummaryResponse(
        session_id=session_id,
        summary_index=summary_index,
        original_text=updated_summary.original_text,
        summary_text=updated_summary.summary_text,
        parameters=updated_summary.parameters,
        created_at=updated_summary.created_at
    )

@router.delete("/sessions/{session_id}/summaries/{summary_index}")
async def delete_summary(
    session_id: int,
    summary_index: int,
    current_user: User = Depends(get_current_user)
):
    success = await delete_summary_from_chat(current_user, session_id, summary_index)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    return {"message": "Summary deleted successfully"}

@router.post("/meta-summarize", response_model=MetaSummaryResponse)
async def generate_meta_summary(
    request: MetaSummaryRequest,
    current_user: User = Depends(get_current_user)
):
    session = await get_chat_session(current_user, request.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    meta_summary = await ChatService.generate_meta_summary(
        current_user,
        request.session_id,
        request.parameters
    )
    
    return MetaSummaryResponse(
        session_id=request.session_id,
        title=session.title,
        meta_summary=meta_summary,
        created_at=datetime.utcnow()
    )

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user)
):
    success = await delete_chat_session(current_user, session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return {"message": "Chat session deleted successfully"}