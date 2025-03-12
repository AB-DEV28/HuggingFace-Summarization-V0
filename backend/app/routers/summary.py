from fastapi import APIRouter, Depends, Cookie, HTTPException, status
from typing import List, Optional
from app.schemas import (
    SummaryRequest, 
    SummaryResponse, 
    SummaryUpdateRequest,
    SummaryParameters
)
from app.services.summary_service import SummaryService
from app.utils import get_current_user
from app.models import User
from app.crud import get_user_history, remove_summary, update_summary

router = APIRouter(prefix="/summary", tags=["Summarization"])

@router.post("", response_model=SummaryResponse)
async def summarize(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user)
):
    if len(request.text.strip()) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text must be at least 100 characters long"
        )
        
    history_entry = await SummaryService.create_summary(
        current_user,
        request.text,
        request.parameters
    )
    
    return SummaryResponse(
        original_text=request.text,
        summary_text=history_entry.summary_text,
        parameters=history_entry.parameters,
        created_at=history_entry.created_at
    )

@router.get("/history", response_model=List[SummaryResponse])
async def get_history(current_user: User = Depends(get_current_user)):
    history = await get_user_history(current_user)
    return [SummaryResponse(
        original_text=entry.original_text,
        summary_text=entry.summary_text,
        parameters=entry.parameters,
        created_at=entry.created_at
    ) for entry in history]

@router.delete("/{summary_index}")
async def delete_summary(
    summary_index: int,
    current_user: User = Depends(get_current_user)
):
    success = await remove_summary(current_user, summary_index)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    return {"message": "Summary deleted successfully"}

@router.patch("/{summary_index}", response_model=SummaryResponse)
async def patch_summary(
    summary_index: int,
    request: SummaryUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    update_dict = request.dict(exclude_unset=True, exclude_none=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid update data provided"
        )

    if "text" in update_dict:
        if len(request.text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must be at least 100 characters long"
            )
            
        # Generate new summary only if text is being updated
        history_entry = await SummaryService.create_summary(
            current_user,
            request.text,
            request.parameters or SummaryParameters(**current_user.history[summary_index].parameters)
        )
        
        success = await update_summary(
            current_user,
            summary_index,
            request.text,
            history_entry.parameters
        )
    else:
        # Update only parameters
        success = await update_summary(
            current_user,
            summary_index,
            current_user.history[summary_index].original_text,
            request.parameters.dict()
        )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found"
        )
    
    updated_entry = current_user.history[summary_index]
    return SummaryResponse(
        original_text=updated_entry.original_text,
        summary_text=updated_entry.summary_text,
        parameters=updated_entry.parameters,
        created_at=updated_entry.created_at
    )
