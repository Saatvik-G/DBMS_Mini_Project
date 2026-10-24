import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base, ACTIVE_SQL_ENGINE
from app.db.mongo import get_mongo_db, init_mongo_indexes
from app.routers import (
    health, auth, dashboard, cases, timeline, people, organizations,
    vehicles, devices, locations, evidence, officers, documents,
    search, relationships, analytics, dbms_concepts
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("intelligence_fusion")

# Create all SQL tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database tables initialized on engine: {ACTIVE_SQL_ENGINE}")
except Exception as e:
    logger.error(f"Error initializing SQL tables: {e}")

# Initialize MongoDB
try:
    mdb = get_mongo_db()
    if mdb is not None:
        init_mongo_indexes(mdb)
except Exception as e:
    logger.warning(f"MongoDB startup warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Intelligence Fusion Platform — College DBMS Mini Project by Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred while processing the request. Relational/Document operation failed.", "error": str(exc)}
    )

# Register Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(cases.router, prefix=settings.API_V1_STR)
app.include_router(timeline.router, prefix=settings.API_V1_STR)
app.include_router(people.router, prefix=settings.API_V1_STR)
app.include_router(organizations.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(devices.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(officers.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(relationships.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(dbms_concepts.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "type": settings.PROJECT_TYPE,
        "team": settings.TEAM_MEMBERS,
        "status": "Operational",
        "api_docs": "/docs",
        "health": "/api/health"
    }
