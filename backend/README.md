# etgen — Backend

FastAPI-based backend for the Industrial Knowledge Intelligence Platform.

## Stack

- **FastAPI** — async REST API framework
- **NetworkX** — in-memory knowledge graph
- **Pydantic** — request/response validation
- **Ollama** (optional) — local LLM for response generation

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate mock data
python -m app.generate_mock_data

# Start the server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint       | Description                        |
|--------|----------------|------------------------------------|
| GET    | `/`            | Health check                       |
| POST   | `/api/chat`    | Query the multi-agent RAG pipeline |
| GET    | `/api/graph`   | Get knowledge graph data           |
| POST   | `/api/upload`  | Upload and ingest a document       |

## Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Package marker
│   ├── main.py                  # FastAPI app & routes
│   ├── knowledge_graph.py       # Knowledge graph builder
│   ├── rag_pipeline.py          # Multi-agent RAG engine
│   └── generate_mock_data.py    # Mock data generator
├── data/                        # Generated mock data
│   ├── incidents/
│   ├── logs/
│   └── manuals/
├── requirements.txt
└── Dockerfile
```
