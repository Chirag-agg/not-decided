from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Import our modules
from .rag_pipeline import query_assistant
from .knowledge_graph import build_knowledge_graph

app = FastAPI(title="Industrial Knowledge Intelligence API")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    print("Initializing Enterprise Backend...")
    build_knowledge_graph()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Industrial Knowledge Intelligence API"}

@app.post("/api/chat", response_model=QueryResponse)
def chat_with_copilot(request: QueryRequest):
    try:
        response, sources, action, traces = query_assistant(request.query)
        return {"answer": response, "sources": sources, "action": action, "traces": traces}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/graph")
def get_knowledge_graph():
    """Returns the knowledge graph data for visualization"""
    try:
        graph_data = build_knowledge_graph()
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Simulates live document ingestion and updating the graph"""
    try:
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(2)
        
        # In a real app, this would chunk the PDF, embed it, and add to Vector DB
        return {"filename": file.filename, "status": "Ingested", "nodes_added": 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
