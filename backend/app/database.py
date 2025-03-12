import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import User
from app.config import settings
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    try:
        # Configure DNS resolver with Google's DNS
        dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
        dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

        # Create motor client with more specific options
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=30000,  # Increased timeout
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            maxIdleTimeMS=30000,
            retryWrites=True
        )
        
        # Test connection
        try:
            await client.admin.command('ping')
            logger.info("Successfully pinged MongoDB cluster")
        except Exception as e:
            logger.error(f"Failed to ping MongoDB cluster: {str(e)}")
            raise

        # Initialize beanie with only User model
        await init_beanie(
            database=client[settings.DB_NAME],
            document_models=[User]
        )
        
        logger.info("Successfully initialized database connection")
        
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise