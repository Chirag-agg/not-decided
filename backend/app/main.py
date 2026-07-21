from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Import our modules
from .rag_pipeline import query_assistant
from .knowledge_graph import build_knowledge_graph
from .config import settings
from .utils.logger import get_logger
from .utils.logger import get_logger
from .utils.cache import cache
from .rules_engine import evaluate_compliance, get_asset_health

logger = get_logger(__name__)

app = FastAPI(title="Industrial Knowledge Intelligence API")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
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
    matched_entity_id: str | None = None

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
        response, sources, action, traces, matched_entity_id = query_assistant(request.query)
        return {
            "answer": response, 
            "sources": sources, 
            "action": action, 
            "traces": traces,
            "matched_entity_id": matched_entity_id
        }
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
    """Parses uploaded file, extracts entities, and updates the knowledge graph dynamically."""
    try:
        filename = file.filename
        
        if filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="PDF parsing is unsupported in the current version. Please upload .txt, .csv, or .json.")
            
        # Read content
        content_bytes = await file.read()
        try:
            content_str = content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            content_str = content_bytes.decode('latin-1')
            
        import csv
        import json
        import io
        import re
        
        parsed_text = ""
        if filename.endswith(".csv"):
            reader = csv.reader(io.StringIO(content_str))
            parsed_text = " ".join([" ".join(row) for row in reader])
        elif filename.endswith(".json"):
            data = json.loads(content_str)
            parsed_text = json.dumps(data)
        else:
            parsed_text = content_str
            
        # Extract entities
        # Pattern: 2-4 uppercase letters, dash, alphanumerics, optional dash and digits (e.g. PMP-101, SEN-T1, INC-23-089)
        pattern = r'\b[A-Z]{2,4}-[A-Z0-9]+(?:-\d+)?\b'
        matches = set(re.findall(pattern, parsed_text.upper()))
        
        # Document classification
        doc_group = "Document"
        lower_text = parsed_text.lower()
        lower_name = filename.lower()
        if "manual" in lower_text or "manual" in lower_name:
            doc_group = "Document"
        elif "incident" in lower_text or "incident" in lower_name:
            doc_group = "Incident"
        elif "work order" in lower_text or "wo-" in lower_text or "work order" in lower_name:
            doc_group = "WorkOrder"
            
        # Fetch current graph
        graph_data = cache.get("knowledge_graph")
        if not graph_data:
            graph_data = build_knowledge_graph()
            
        nodes_added = 0
        edges_added = 0
        
        # Check existing nodes
        existing_node_ids = {node["id"] for node in graph_data["nodes"]}
        
        # Add document node
        doc_node_id = filename
        if doc_node_id not in existing_node_ids:
            graph_data["nodes"].append({
                "id": doc_node_id,
                "label": f"{doc_group[:3]}: {filename}",
                "group": doc_group
            })
            existing_node_ids.add(doc_node_id)
            nodes_added += 1
            
        # Process extracted entities
        for entity in matches:
            if entity not in existing_node_ids:
                # Add new entity node (default to Equipment for unknown tags)
                graph_data["nodes"].append({
                    "id": entity,
                    "label": f"Eq: {entity}",
                    "group": "Equipment"
                })
                existing_node_ids.add(entity)
                nodes_added += 1
                
            # Add edge
            # Ensure "links" key exists (networkx uses "links" normally, but we ensure it)
            if "links" not in graph_data:
                graph_data["links"] = []
            edge = {"source": doc_node_id, "target": entity, "relationship": "references"}
            graph_data["links"].append(edge)
            edges_added += 1
            
        # Update cache
        cache.set("knowledge_graph", graph_data)
        logger.info(f"Successfully ingested {filename}. Found {len(matches)} entities.")
        
        return {
            "filename": filename,
            "status": "Ingested",
            "nodes_added": nodes_added,
            "edges_added": edges_added,
            "entities_found": list(matches)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during file ingestion.")

@app.get("/api/compliance")
def get_compliance():
    """Evaluates compliance rules dynamically against the live graph."""
    try:
        graph_data = cache.get("knowledge_graph")
        if not graph_data:
            graph_data = build_knowledge_graph()
        return evaluate_compliance(graph_data)
    except Exception as e:
        logger.error(f"Error evaluating compliance: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to evaluate compliance.")

@app.get("/api/assets")
def get_assets():
    """Extracts dynamic asset health metrics from the live graph."""
    try:
        graph_data = cache.get("knowledge_graph")
        if not graph_data:
            graph_data = build_knowledge_graph()
        return get_asset_health(graph_data)
    except Exception as e:
        logger.error(f"Error fetching assets: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve asset data.")
