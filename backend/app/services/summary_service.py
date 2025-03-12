from fastapi import HTTPException, status
import requests
import logging
from app.config import settings
from app.models import User, SummaryItem
from app.schemas import SummaryParameters

logger = logging.getLogger(__name__)

class SummaryService:
    @staticmethod
    async def create_summary(user: User, text: str, parameters: SummaryParameters) -> SummaryItem:
        if len(text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must be at least 100 characters long"
            )
        
        try:
            # Call HuggingFace API to generate summary
            summary_text = await SummaryService._call_huggingface_api(text, parameters)
            
            # Create and return a summary item (without saving it)
            summary_item = SummaryItem(
                original_text=text,
                summary_text=summary_text,
                parameters=parameters.dict()
            )
            
            return summary_item
            
        except Exception as e:
            logger.error(f"Summary generation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate summary"
            )
    
    @staticmethod
    async def _call_huggingface_api(text: str, parameters: SummaryParameters) -> str:
        try:
            # Check if HUGGINGFACE_API_URL is defined in settings
            if not hasattr(settings, 'HUGGINGFACE_API_URL'):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="HUGGINGFACE_API_URL not configured"
                )
                
            headers = {
                "Authorization": f"Bearer {settings.HF_TOKEN}"
            }
            
            payload = {
                "inputs": text,
                "parameters": {
                    "min_length": parameters.min_length,
                    "max_length": parameters.max_length,
                    "do_sample": parameters.do_sample
                }
            }
            
            response = requests.post(
                settings.HUGGINGFACE_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()[0]['summary_text']
        except requests.exceptions.RequestException as e:
            logger.error(f"HuggingFace API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Summary service temporarily unavailable"
            )
