<h1 align="center">
  ⚡ Keystone
</h1>

<p align="center">
  <b>Keystone Platform</b><br/>
  A multi-agent AI system powered by a live Knowledge Graph hub for enterprise asset management, compliance, and automated diagnostics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🎯 Overview

**Keystone** eliminates knowledge fragmentation in asset-intensive industries by merging heterogeneous unstructured data (PDFs, manuals, incident reports) into a single, unified Knowledge Graph. 

Unlike standard RAG pipelines that use isolated Vector Databases, this platform operates on a **Unified Hub Architecture**. When a document is ingested, it mutates a live graph topology. The AI Copilot and the Compliance Rule Engine both evaluate this exact same topology in real-time, providing ground-truth intelligence that is structurally traceable.

### Core Features
- 🕸️ **Unified Graph Hub**: A live `NetworkX` graph cache that acts as the single source of truth for the entire application.
- 🤖 **Multi-Agent Orchestrator**: 4 autonomous agents (Document Retrieval, Graph Traversal, Synthesis, Action) that walk graph edges to diagnose complex machinery issues.
- 📋 **Structural Compliance Engine**: A headless rules engine that constantly evaluates the graph for regulatory gaps (e.g., detecting if an equipment node has an incident with no attached work order).
- 📲 **Field-Ready UI**: A fully responsive, dark-mode dashboard built for mobile field technicians, featuring live IoT telemetry and force-directed topology visualizations.

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│    Dashboard · Live Topology · Copilot Chat · QMS      │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API
┌──────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend                      │
│                                                        │
│  [Ingestion] ────► [KNOWLEDGE GRAPH] ◄──── [Rules]     │
│                           ▲                            │
│                      [RAG Agents]                      │
└────────────────────────────────────────────────────────┘
```

*(See `architecture_diagram.md` for a detailed technical schematic).*

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Ollama** (Running locally with `llama3:latest` for the LLM fallback to work. If not running, the platform safely uses heuristic synthesis).

### Option 1 — Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### Option 2 — Manual Setup

**1. Start the Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.generate_mock_data
uvicorn app.main:app --reload --port 8000
```

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🎥 Running the Golden Path Demo

1. **Open the App**: Navigate to `http://localhost:3000`.
2. **View the Topology**: Click the `Knowledge Base` module. You will see the live factory graph.
3. **Ingest Unstructured Data**: Click the `Upload` button in the sidebar and select a sample incident report (e.g., `sample_manual.txt`).
4. **Watch the Graph Mutate**: The pipeline will parse the text via regex, extract the equipment (`MTR-999`) and incident (`INC-23-089`), and instantly inject them into the live topology.
5. **Test the Copilot**: Ask the chat: `"What is the status of MTR-999?"`. The Multi-Agent Orchestrator will walk the graph edges, pass the context to the LLM, and focus the UI explicitly on the new node.
6. **Verify Compliance**: Navigate to the `Compliance` module. You will see the new incident has been automatically flagged as a regulatory violation because it lacks a connected Work Order. Click `Gen Evidence` to generate the audit package.

## 📁 Project Structure

```
keystone/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI App & Endpoints
│   │   ├── knowledge_graph.py  # Live Graph Cache
│   │   ├── rag_pipeline.py     # 4-Agent Orchestrator
│   │   └── rules_engine.py     # Structural Compliance Engine
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js Pages (Graph, Assets, QMS)
│   │   ├── components/         # Copilot Chat, Viz, Sidebar
│   │   └── utils/              # API and Config layers
```

## 📜 License
This project is licensed under the [MIT License](./LICENSE).
