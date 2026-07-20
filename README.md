<h1 align="center">
  ⚡ etgen
</h1>

<p align="center">
  <b>Industrial Knowledge Intelligence Platform</b><br/>
  A multi-agent RAG system with knowledge graph visualization for enterprise asset management.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Overview

**etgen** is an enterprise-grade Industrial Knowledge Intelligence platform that combines:

- 🤖 **Multi-Agent RAG Pipeline** — ReAct-style reasoning over equipment manuals, incident reports, and maintenance logs
- 🕸️ **Knowledge Graph Visualization** — Interactive force-directed graph of equipment, documents, incidents, and work orders
- 💬 **AI Copilot Chat** — Natural-language diagnostics with agent trace visibility
- 📋 **Compliance & Asset Management** — Structured views for maintenance workflows

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                   │
│          Next.js 16 · React 19             │
│   Dashboard · Graph · Chat · Compliance     │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│                  Backend                    │
│            FastAPI · Python 3.11+           │
│   Multi-Agent Engine · Knowledge Graph      │
│   Vector Search · Graph Traversal           │
└─────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- (Optional) **Docker** & **Docker Compose**

### Option 1 — Docker Compose

```bash
docker compose up --build
```

Frontend: [http://localhost:3000](http://localhost:3000) · Backend: [http://localhost:8000](http://localhost:8000)

### Option 2 — Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.generate_mock_data
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
etgen/
├── backend/
│   ├── app/                    # Python package
│   │   ├── main.py             # FastAPI application
│   │   ├── knowledge_graph.py  # NetworkX graph builder
│   │   ├── rag_pipeline.py     # Multi-agent RAG engine
│   │   └── generate_mock_data.py
│   ├── data/                   # Mock data (manuals, logs, incidents)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   └── components/         # React components
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend  | FastAPI, Python 3.11+              |
| Graph    | NetworkX, react-force-graph-2d     |
| AI/ML    | Ollama (llama3), RAG Pipeline      |
| DevOps   | Docker, Docker Compose             |

## License

This project is licensed under the [MIT License](./LICENSE).
