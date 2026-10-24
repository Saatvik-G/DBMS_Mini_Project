import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Track which engine was actually connected
ACTIVE_SQL_ENGINE = "Unknown"
engine = None
SessionLocal = None

def init_sql_engine():
    global ACTIVE_SQL_ENGINE, engine, SessionLocal
    
    # Try connecting to PostgreSQL first
    pg_url = settings.DATABASE_URL
    try:
        temp_engine = create_engine(pg_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
        ACTIVE_SQL_ENGINE = "PostgreSQL"
        logger.info("Successfully connected to primary PostgreSQL database.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection at {pg_url} not available ({e}). Falling back to local SQLite engine.")
        # Fallback to local SQLite database
        sqlite_url = settings.FALLBACK_SQLITE_URL
        engine = create_engine(
            sqlite_url, 
            connect_args={"check_same_thread": False}
        )
        
        # Enforce foreign key constraints in SQLite
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
            
        ACTIVE_SQL_ENGINE = "SQLite (Local Fallback - PostgreSQL offline)"
        logger.info(f"Initialized fallback SQLite database: {sqlite_url}")

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

init_sql_engine()

def get_db():
    global SessionLocal
    if SessionLocal is None:
        init_sql_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
