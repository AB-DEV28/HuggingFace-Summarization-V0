from fastapi import HTTPException, status
import logging
from app.models import User, ChatSession, SummaryItem
from app.schemas import SummaryParameters
from app.services.summary_service import SummaryService
from app.crud import (
    add_summary_to_chat,
    get_chat_session,
    update_chat_meta_summary,
    create_chat_session
)
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    async def create_session(user: User, title: str) -> int:
        try:
            session_id = await create_chat_session(user, title)
            return session_id
        except Exception as e:
            logger.error(f"Error creating chat session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create chat session"
            )
    
    @staticmethod
    async def add_summary(
        user: User, 
        session_id: int, 
        text: str, 
        parameters: Dict
    ) -> tuple[int, str]:
        """Add a summary to a chat session"""
        session = await get_chat_session(user, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        if len(text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must be at least 100 characters long"
            )
            
        try:
            # Create summary parameters object
            params_obj = SummaryParameters(**parameters)
            
            # Call HuggingFace API to generate summary
            summary_text = await SummaryService._call_huggingface_api(text, params_obj)
            
            # Add summary to the chat session
            summary_index = await add_summary_to_chat(
                user=user,
                session_id=session_id,
                original_text=text,
                summary_text=summary_text,
                parameters=parameters
            )
            
            if summary_index is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to add summary to chat"
                )
                
            return summary_index, summary_text
            
        except Exception as e:
            logger.error(f"Error adding summary: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate summary: {str(e)}"
            )
    
    @staticmethod
    async def generate_meta_summary(
        user: User, 
        session_id: int, 
        parameters: Optional[Dict] = None
    ) -> str:
        """Generate a meta-summary of all summaries in the chat session"""
        session = await get_chat_session(user, session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
            
        if not session.summaries:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chat session has no summaries to generate a meta-summary"
            )
            
        # Combine all summaries into a single text
        combined_text = "\n\n".join([
            f"Summary {i+1}: {summary.summary_text}" 
            for i, summary in enumerate(session.summaries)
        ])
        
        if len(combined_text) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough content to generate a meta-summary (minimum 100 characters)"
            )
            
        try:
            # Use default parameters if none provided
            default_params = {"min_length": 100, "max_length": 300, "do_sample": False}
            summary_params = parameters if parameters else default_params
            
            params_obj = SummaryParameters(**summary_params)
            
            # Generate meta-summary
            meta_summary = await SummaryService._call_huggingface_api(combined_text, params_obj)
            
            # Update the chat session with the meta-summary
            success = await update_chat_meta_summary(user, session_id, meta_summary)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update chat with meta-summary"
                )
            
            return meta_summary
        except Exception as e:
            logger.error(f"Meta-summary generation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate meta-summary"
            ) 