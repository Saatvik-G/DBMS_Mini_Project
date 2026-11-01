import logging
import socket
from pymongo import MongoClient, TEXT, ASCENDING
from app.core.config import settings

logger = logging.getLogger(__name__)

mongo_client: MongoClient = None
mongo_db = None
MONGO_CONNECTED = False
_mongo_attempted = False

def _is_mongo_socket_open(host="127.0.0.1", port=27017, timeout=0.15) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def get_mongo_db(force_retry: bool = False):
    global mongo_client, mongo_db, MONGO_CONNECTED, _mongo_attempted
    if mongo_db is not None:
        return mongo_db
    if _mongo_attempted and not MONGO_CONNECTED and not force_retry:
        return None
    _mongo_attempted = True

    # Fast socket probe before initiating driver connection
    if "localhost" in settings.MONGODB_URL or "127.0.0.1" in settings.MONGODB_URL:
        if not _is_mongo_socket_open():
            logger.info("MongoDB socket probe failed (offline). Relational-only mode active.")
            MONGO_CONNECTED = False
            return None

    try:
        mongo_client = MongoClient(
            settings.MONGODB_URL, 
            serverSelectionTimeoutMS=1000,
            connectTimeoutMS=1000
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
        logger.info(f"MongoDB offline at {settings.MONGODB_URL}: {e}")
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
