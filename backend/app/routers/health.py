from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db, ACTIVE_SQL_ENGINE
from app.db.mongo import get_mongo_db, MONGO_CONNECTED
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    sql_status = "error"
    sql_engine_name = ACTIVE_SQL_ENGINE
    try:
        db.execute(text("SELECT 1"))
        sql_status = "connected"
    except Exception as e:
        sql_status = f"error: {str(e)}"

    mongo_status = "disconnected"
    mongo_db_name = settings.MONGODB_DB_NAME
    doc_count = 0
    try:
        mdb = get_mongo_db()
        if mdb is not None:
            mdb.command("ping")
            mongo_status = "connected"
            doc_count = mdb["investigation_documents"].count_documents({})
    except Exception as e:
        mongo_status = f"error: {str(e)}"

    return {
        "status": "online" if sql_status == "connected" else "degraded",
        "project_name": settings.PROJECT_NAME,
        "project_type": settings.PROJECT_TYPE,
        "team_members": settings.TEAM_MEMBERS,
        "databases": {
            "sql": {
                "status": sql_status,
                "engine": sql_engine_name,
                "primary_target": settings.DATABASE_URL
            },
            "nosql": {
                "status": mongo_status,
                "engine": "MongoDB",
                "database": mongo_db_name,
                "document_count": doc_count,
                "target": settings.MONGODB_URL
            }
        }
    }
