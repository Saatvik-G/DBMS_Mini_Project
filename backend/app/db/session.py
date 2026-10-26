import logging
import socket
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Track which engine was actually connected
ACTIVE_SQL_ENGINE = "Unknown"
engine = None
SessionLocal = None

def _is_pg_available(host="127.0.0.1", port=5432, timeout=0.15) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def init_sql_engine():
    global ACTIVE_SQL_ENGINE, engine, SessionLocal
    
    pg_url = settings.DATABASE_URL
    use_pg = False
    
    # Fast socket probe before initiating psycopg
    if "localhost" in pg_url or "127.0.0.1" in pg_url:
        use_pg = _is_pg_available()
    else:
        use_pg = True

    if use_pg:
        try:
            temp_engine = create_engine(pg_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
            with temp_engine.connect() as conn:
                pass
            engine = temp_engine
            ACTIVE_SQL_ENGINE = "PostgreSQL"
            logger.info("Successfully connected to primary PostgreSQL database.")
        except Exception as e:
            logger.warning(f"PostgreSQL probe failed ({e}). Falling back to local SQLite engine.")
            use_pg = False

    if not use_pg:
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
