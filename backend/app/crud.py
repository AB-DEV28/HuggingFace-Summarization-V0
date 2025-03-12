from app.models import User, SummaryItem, ChatSession
from beanie import PydanticObjectId
from typing import Optional, List, Dict
from datetime import datetime

async def get_user_by_email(email: str):
    return await User.find_one(User.email == email)

async def create_user(email: str, hashed_password: str):
    user = User(email=email, hashed_password=hashed_password)
    await user.insert()
    return user

async def delete_user(user: User) -> bool:
    await user.delete()
    return True

async def update_user(user: User, update_data: dict) -> User:
    for field, value in update_data.items():
        setattr(user, field, value)
    await user.save()
    return user

# Chat session operations
async def create_chat_session(user: User, title: str) -> int:
    session = ChatSession(
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    user.chat_sessions.append(session)
    await user.save()
    return len(user.chat_sessions) - 1  # Return the index of the new session

async def get_chat_sessions(user: User) -> List[ChatSession]:
    return user.chat_sessions

async def get_chat_session(user: User, session_id: int) -> Optional[ChatSession]:
    if 0 <= session_id < len(user.chat_sessions):
        return user.chat_sessions[session_id]
    return None

async def update_chat_session_title(user: User, session_id: int, title: str) -> bool:
    if 0 <= session_id < len(user.chat_sessions):
        user.chat_sessions[session_id].title = title
        user.chat_sessions[session_id].updated_at = datetime.utcnow()
        await user.save()
        return True
    return False

async def delete_chat_session(user: User, session_id: int) -> bool:
    if 0 <= session_id < len(user.chat_sessions):
        user.chat_sessions.pop(session_id)
        await user.save()
        return True
    return False

# Summary operations within chat sessions
async def add_summary_to_chat(
    user: User, 
    session_id: int, 
    original_text: str, 
    summary_text: str, 
    parameters: Dict
) -> Optional[int]:
    if 0 <= session_id < len(user.chat_sessions):
        summary = SummaryItem(
            original_text=original_text,
            summary_text=summary_text,
            parameters=parameters,
            created_at=datetime.utcnow()
        )
        user.chat_sessions[session_id].summaries.append(summary)
        user.chat_sessions[session_id].updated_at = datetime.utcnow()
        await user.save()
        return len(user.chat_sessions[session_id].summaries) - 1  # Return index of new summary
    return None

async def get_summary_from_chat(
    user: User, 
    session_id: int, 
    summary_index: int
) -> Optional[SummaryItem]:
    if (0 <= session_id < len(user.chat_sessions) and 
        0 <= summary_index < len(user.chat_sessions[session_id].summaries)):
        return user.chat_sessions[session_id].summaries[summary_index]
    return None

async def update_summary_in_chat(
    user: User,
    session_id: int,
    summary_index: int,
    original_text: Optional[str] = None,
    summary_text: Optional[str] = None,
    parameters: Optional[Dict] = None
) -> bool:
    if (0 <= session_id < len(user.chat_sessions) and 
        0 <= summary_index < len(user.chat_sessions[session_id].summaries)):
        summary = user.chat_sessions[session_id].summaries[summary_index]
        if original_text is not None:
            summary.original_text = original_text
        if summary_text is not None:
            summary.summary_text = summary_text
        if parameters is not None:
            summary.parameters = parameters
        user.chat_sessions[session_id].updated_at = datetime.utcnow()
        await user.save()
        return True
    return False

async def delete_summary_from_chat(
    user: User,
    session_id: int,
    summary_index: int
) -> bool:
    if (0 <= session_id < len(user.chat_sessions) and 
        0 <= summary_index < len(user.chat_sessions[session_id].summaries)):
        user.chat_sessions[session_id].summaries.pop(summary_index)
        user.chat_sessions[session_id].updated_at = datetime.utcnow()
        await user.save()
        return True
    return False

async def update_chat_meta_summary(
    user: User,
    session_id: int,
    meta_summary: str
) -> bool:
    if 0 <= session_id < len(user.chat_sessions):
        user.chat_sessions[session_id].meta_summary = meta_summary
        user.chat_sessions[session_id].updated_at = datetime.utcnow()
        await user.save()
        return True
    return False