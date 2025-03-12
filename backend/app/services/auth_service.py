from fastapi import HTTPException, status
import logging
from app.models import User
from app.utils import verify_password, get_password_hash, create_access_token
from app.crud import get_user_by_email, create_user

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    async def register_user(email: str, password: str) -> tuple[User, str]:
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required"
            )

        existing_user = await get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(password)
        new_user = await create_user(email=email, hashed_password=hashed_password)
        access_token = create_access_token(data={"sub": new_user.email})
        
        return new_user, access_token

    @staticmethod
    async def authenticate_user(email: str, password: str) -> tuple[User, str]:
        user = await get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return user, access_token
