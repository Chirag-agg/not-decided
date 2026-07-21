from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Import our modules
from .rag_pipeline import query_assistant
from .knowledge_graph import build_knowledge_graph
from .config import settings
from .utils.logger import get_logger
from .utils.cache import cache

logger = get_logger(__name__)

app = FastAPI(title="Industrial Knowledge Intelligence API")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    action: str | None = None
    traces: list[str] = []

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Enterprise Backend...")
    # Pre-build and cache the knowledge graph on startup
    graph_data = build_knowledge_graph()
    cache.set("knowledge_graph", graph_data)
    logger.info("Knowledge Graph built and cached successfully.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Industrial Knowledge Intelligence API"}

@app.post("/api/chat", response_model=QueryResponse)
def chat_with_copilot(request: QueryRequest):
    try:
        response, sources, action, traces = query_assistant(request.query)
        return {"answer": response, "sources": sources, "action": action, "traces": traces}
    except Exception as e:
        logger.error(f"Error processing chat query: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while processing your request.")

@app.get("/api/graph")
def get_knowledge_graph():
    """Returns the knowledge graph data for visualization"""
    try:
        graph_data = cache.get("knowledge_graph")
        if not graph_data:
            logger.info("Knowledge graph cache miss. Rebuilding...")
            graph_data = build_knowledge_graph()
            cache.set("knowledge_graph", graph_data)
        return graph_data
    except Exception as e:
        logger.error(f"Error fetching knowledge graph: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve knowledge graph.")

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Simulates live document ingestion and updating the graph"""
    try:
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(2)
        
        # In a real app, this would chunk the PDF, embed it, and add to Vector DB
        logger.info(f"Successfully ingested file: {file.filename}")
        return {"filename": file.filename, "status": "Ingested", "nodes_added": 1}
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during file ingestion.")
