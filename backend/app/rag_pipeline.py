import json
import os
import time

class MultiAgentEngine:
    """
    A sophisticated Multi-Agent architecture simulating ReAct (Reasoning and Acting) workflows.
    In a full production environment, these methods would call LLMs and real Vector/Graph DBs.
    For the hackathon, this demonstrates the precise architectural pattern of an Enterprise AI.
    """
    
    def __init__(self):
        self.traces = []

    def _log_trace(self, agent_name: str, action: str):
        """Simulates agent reasoning traces."""
        self.traces.append(f"[{agent_name}] {action}")
        
    def vector_search_agent(self, query: str):
        self._log_trace("SYS_AGENT_SEARCH", f"Querying vector space (dim=1536) for: '{query}'")
        # Simulating vector retrieval
        if "vibration" in query.lower() or "pump" in query.lower():
            self._log_trace("SYS_AGENT_SEARCH", "Retrieved 3 high-confidence chunks from PMP-101_OEM_Manual")
            return ["PMP-101_OEM_Manual.txt"]
        else:
            self._log_trace("SYS_AGENT_SEARCH", "No specific equipment vectors matched.")
            return []

    def graph_traversal_agent(self, entity_id: str):
        self._log_trace("SYS_AGENT_GRAPH", f"Traversing knowledge graph for entity: {entity_id}")
        # Simulating graph traversal
        if entity_id == "PMP-101":
            self._log_trace("SYS_AGENT_GRAPH", "Found historical incident INC-23-089 (Bearing Failure)")
            self._log_trace("SYS_AGENT_GRAPH", "Found related Work Orders: WO-102 (Lube PMP-101)")
            return ["INC-23-089", "WO-102"]
        return []

    def synthesis_agent(self, context_docs, graph_nodes, query):
        import requests
        self._log_trace("SYS_AGENT_SYNTH", "Fusing cross-modal context (Vectors + Graph)")
        
        if "PMP-101_OEM_Manual.txt" in context_docs and "INC-23-089" in graph_nodes:
            self._log_trace("SYS_AGENT_SYNTH", "Anomaly detected: Current query matches historical incident signature.")
            
            prompt = (
                f"You are an Industrial AI Expert. A user asked: '{query}'. "
                "Context: The equipment is PMP-101. It has a history of bearing failures (INC-23-089). "
                "The OEM manual states warning vibration is > 4.5 mm/s. "
                "Write a highly professional, short technical diagnostic (3-4 sentences max) recommending an immediate inspection."
            )
            
            self._log_trace("SYS_AGENT_SYNTH", "Generating response via local LLM (ollama:llama3:latest)...")
            try:
                # Try to call local Ollama
                res = requests.post("http://localhost:11434/api/generate", json={
                    "model": "llama3:latest",
                    "prompt": prompt,
                    "stream": False
                }, timeout=10)
                res.raise_for_status()
                answer = res.json().get("response", "").strip()
                self._log_trace("SYS_AGENT_SYNTH", "LLM generation successful.")
            except Exception as e:
                # Fallback to mock if Ollama isn't running or times out
                self._log_trace("SYS_AGENT_SYNTH", f"LLM generation failed ({str(e)}). Using cached heuristic.")
                answer = (
                    "Based on the unified knowledge base, centrifugal pump PMP-101 has a history of bearing failures related to vibration. "
                    "A past incident (INC-23-089) caused an unplanned shutdown due to lack of lubrication.\n\n"
                    "According to the OEM Manual, warning vibration is > 4.5 mm/s. The recommended troubleshooting step is to check "
                    "lubrication and replace bearings if worn. Given the historical graph data, I recommend an immediate inspection."
                )
            return answer, True
        else:
            self._log_trace("SYS_AGENT_SYNTH", "Insufficient context for definitive diagnostic.")
            answer = "I searched the manuals and knowledge base. Please provide more specific equipment IDs like 'PMP-101' or symptoms like 'vibration' so I can narrow down the root cause."
            return answer, False

    def action_agent(self, requires_action: bool):
        if requires_action:
            self._log_trace("SYS_AGENT_ACTION", "Evaluating required maintenance actions.")
            self._log_trace("SYS_AGENT_ACTION", "Decision: Generate Preventive Work Order payload.")
            return "create_work_order_pmp101"
        return None

    def execute_query(self, query: str):
        """Main execution loop for the Multi-Agent system."""
        self.traces = []
        self._log_trace("ORCHESTRATOR", "Initializing query resolution pipeline.")
        
        # 1. Search Vector Space
        docs = self.vector_search_agent(query)
        
        # 2. Extract Entities & Traverse Graph (Hardcoded extraction for demo)
        graph_nodes = []
        if "vibration" in query.lower() or "pump" in query.lower():
            graph_nodes = self.graph_traversal_agent("PMP-101")
            
        # 3. Synthesize
        answer, requires_action = self.synthesis_agent(docs, graph_nodes, query)
        
        # 4. Determine Actions
        action = self.action_agent(requires_action)
        
        sources = docs + graph_nodes
        self._log_trace("ORCHESTRATOR", f"Pipeline complete. Yielding {len(sources)} sources and 1 action.")
        
        return answer, sources, action, self.traces


def query_assistant(query: str):
    """Entry point for the FastAPI route."""
    engine = MultiAgentEngine()
    return engine.execute_query(query)
