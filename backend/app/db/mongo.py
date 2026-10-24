import logging
from pymongo import MongoClient, TEXT, ASCENDING
from app.core.config import settings

logger = logging.getLogger(__name__)

mongo_client: MongoClient = None
mongo_db = None
MONGO_CONNECTED = False

def get_mongo_db():
    global mongo_client, mongo_db, MONGO_CONNECTED
    if mongo_db is not None:
        return mongo_db
    try:
        mongo_client = MongoClient(
            settings.MONGODB_URL, 
            serverSelectionTimeoutMS=3000
        )
        # Verify connection
        mongo_client.admin.command('ping')
        mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        MONGO_CONNECTED = True
        logger.info(f"Connected to MongoDB at {settings.MONGODB_URL}, DB: {settings.MONGODB_DB_NAME}")
        
        # Ensure indexes on investigation_documents
        init_mongo_indexes(mongo_db)
        return mongo_db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB at {settings.MONGODB_URL}: {e}")
        MONGO_CONNECTED = False
        return None

def init_mongo_indexes(db):
    try:
        collection = db["investigation_documents"]
        # Create text index for full text search across unstructured document fields
        collection.create_index([
            ("title", TEXT),
            ("content", TEXT),
            ("summary", TEXT),
            ("tags", TEXT)
        ], name="doc_fulltext_index")
        
        # Single field indexes for fast filtering and relationship joins
        collection.create_index([("case_id", ASCENDING)], name="idx_case_id")
        collection.create_index([("document_type", ASCENDING)], name="idx_doc_type")
        collection.create_index([("source_type", ASCENDING)], name="idx_source_type")
        collection.create_index([("created_at", ASCENDING)], name="idx_created_at")
        logger.info("MongoDB indexes verified on 'investigation_documents'.")
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB indexes: {e}")

# Initialize on module import
get_mongo_db()
