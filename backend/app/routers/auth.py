from fastapi import APIRouter, Response, status, Depends, HTTPException, Cookie
from typing import Optional
from app.schemas import UserCreate, UserResponse, LoginRequest, UserUpdate
from app.services.auth_service import AuthService
from app.config import settings
from app.utils import get_current_user, get_password_hash
from app.crud import delete_user, update_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(response: Response, user: UserCreate):
    new_user, access_token = await AuthService.register_user(user.email, user.password)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return UserResponse(
        email=new_user.email,
        message="User created and logged in successfully"
    )

@router.post("/login", response_model=UserResponse)
async def login(response: Response, login_data: LoginRequest):
    user, access_token = await AuthService.authenticate_user(login_data.email, login_data.password)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return UserResponse(
        email=user.email,
        message="Login successful"
    )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    return UserResponse(
        email=current_user.email,
        message="User information retrieved successfully"
    )

@router.delete("/me")
async def delete_current_user(
    response: Response,
    current_user = Depends(get_current_user)
):
    await delete_user(current_user)
    response.delete_cookie("access_token")
    return {"message": "User deleted successfully"}

@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user = Depends(get_current_user)
):
    update_dict = update_data.dict(exclude_unset=True, exclude_none=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid update data provided"
        )
    
    if "password" in update_dict:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
    
    updated_user = await update_user(current_user, update_dict)
    return UserResponse(
        email=updated_user.email,
        message="User updated successfully"
    )
