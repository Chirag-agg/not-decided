import re
import requests
from typing import List, Tuple, Optional
from .config import settings
from .utils.logger import get_logger

logger = get_logger(__name__)

# Known Equipment IDs for simple Entity Extraction
KNOWN_EQUIPMENT = [
    "PMP-101", "PMP-102", "MTR-501", "MTR-502", 
    "VLV-201", "VLV-202", "VLV-203", "HX-301", 
    "SEN-T1", "SEN-T2", "SEN-V1", "SEN-V2"
]

class BaseAgent:
    def __init__(self, trace_log: List[str]):
        self.trace_log = trace_log

    def _log_trace(self, agent_name: str, action: str):
        msg = f"[{agent_name}] {action}"
        self.trace_log.append(msg)
        logger.info(msg)


class VectorSearchAgent(BaseAgent):
    def execute(self, query: str) -> List[str]:
        self._log_trace("SYS_AGENT_SEARCH", f"Querying vector space (dim=1536) for: '{query}'")
        
        # Simulating vector retrieval based on basic keyword matching for demo purposes
        if "vibration" in query.lower() or "pump" in query.lower() or "pmp-101" in query.lower():
            self._log_trace("SYS_AGENT_SEARCH", "Retrieved 3 high-confidence chunks from PMP-101_OEM_Manual")
            return ["PMP-101_OEM_Manual.txt"]
        else:
            self._log_trace("SYS_AGENT_SEARCH", "No specific equipment vectors matched.")
            return []


class GraphTraversalAgent(BaseAgent):
    def execute(self, entity_id: str) -> List[str]:
        self._log_trace("SYS_AGENT_GRAPH", f"Traversing knowledge graph for entity: {entity_id}")
        
        # Simulating graph traversal
        if entity_id == "PMP-101":
            self._log_trace("SYS_AGENT_GRAPH", "Found historical incident INC-23-089 (Bearing Failure)")
            self._log_trace("SYS_AGENT_GRAPH", "Found related Work Orders: WO-102 (Lube PMP-101)")
            return ["INC-23-089", "WO-102"]
        elif entity_id:
            self._log_trace("SYS_AGENT_GRAPH", f"Found active monitoring nodes for {entity_id}")
            return [f"MONITOR-{entity_id}"]
        return []


class SynthesisAgent(BaseAgent):
    def execute(self, context_docs: List[str], graph_nodes: List[str], query: str, entity_id: Optional[str]) -> Tuple[str, bool]:
        self._log_trace("SYS_AGENT_SYNTH", "Fusing cross-modal context (Vectors + Graph)")
        
        if "PMP-101_OEM_Manual.txt" in context_docs and "INC-23-089" in graph_nodes:
            self._log_trace("SYS_AGENT_SYNTH", "Anomaly detected: Current query matches historical incident signature.")
            
            prompt = (
                f"You are an Industrial AI Expert. A user asked: '{query}'. "
                "Context: The equipment is PMP-101. It has a history of bearing failures (INC-23-089). "
                "The OEM manual states warning vibration is > 4.5 mm/s. "
                "Write a highly professional, short technical diagnostic (3-4 sentences max) recommending an immediate inspection."
            )
            
            self._log_trace("SYS_AGENT_SYNTH", f"Generating response via local LLM ({settings.MODEL_NAME})...")
            try:
                # Try to call local Ollama
                res = requests.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json={
                    "model": settings.MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                }, timeout=settings.LLM_TIMEOUT)
                res.raise_for_status()
                answer = res.json().get("response", "").strip()
                self._log_trace("SYS_AGENT_SYNTH", "LLM generation successful.")
            except Exception as e:
                # Fallback to mock if Ollama isn't running or times out
                logger.warning(f"LLM generation failed: {str(e)}. Using cached heuristic.")
                self._log_trace("SYS_AGENT_SYNTH", "LLM generation failed. Using cached heuristic.")
                answer = (
                    "Based on the unified knowledge base, centrifugal pump PMP-101 has a history of bearing failures related to vibration. "
                    "A past incident (INC-23-089) caused an unplanned shutdown due to lack of lubrication.\n\n"
                    "According to the OEM Manual, warning vibration is > 4.5 mm/s. The recommended troubleshooting step is to check "
                    "lubrication and replace bearings if worn. Given the historical graph data, I recommend an immediate inspection."
                )
            return answer, True
        elif entity_id:
            self._log_trace("SYS_AGENT_SYNTH", f"Generating contextual summary for {entity_id}")
            answer = f"I've checked the knowledge graph for {entity_id}. All systems are currently reporting nominal values. Would you like me to pull the latest maintenance logs?"
            return answer, False
        else:
            self._log_trace("SYS_AGENT_SYNTH", "Insufficient context for definitive diagnostic.")
            answer = "I searched the manuals and knowledge base. Please provide more specific equipment IDs like 'PMP-101' or symptoms like 'vibration' so I can narrow down the root cause."
            return answer, False


class ActionAgent(BaseAgent):
    def execute(self, requires_action: bool, entity_id: Optional[str]) -> Optional[str]:
        if requires_action and entity_id:
            self._log_trace("SYS_AGENT_ACTION", "Evaluating required maintenance actions.")
            self._log_trace("SYS_AGENT_ACTION", f"Decision: Generate Preventive Work Order payload for {entity_id}.")
            return f"create_work_order_{entity_id.lower().replace('-', '')}"
        return None


class Orchestrator:
    def __init__(self):
        self.traces: List[str] = []
        self.vector_agent = VectorSearchAgent(self.traces)
        self.graph_agent = GraphTraversalAgent(self.traces)
        self.synthesis_agent = SynthesisAgent(self.traces)
        self.action_agent = ActionAgent(self.traces)

    def _extract_entity(self, query: str) -> Optional[str]:
        # Simple entity extraction using regex or known list
        query_upper = query.upper()
        
        # 1. Check against known list
        for eq in KNOWN_EQUIPMENT:
            if eq in query_upper:
                return eq
                
        # 2. Check for generic ID patterns like XXX-123
        match = re.search(r'[A-Z]{3}-\d{3}', query_upper)
        if match:
            return match.group(0)
            
        return None

    def execute_query(self, query: str) -> Tuple[str, List[str], Optional[str], List[str]]:
        self.traces.clear()
        self.vector_agent._log_trace("ORCHESTRATOR", "Initializing query resolution pipeline.")
        
        # 1. Search Vector Space
        docs = self.vector_agent.execute(query)
        
        # 2. Extract Entities
        entity_id = self._extract_entity(query)
        if entity_id:
            self.vector_agent._log_trace("ORCHESTRATOR", f"Extracted Entity ID: {entity_id}")
        else:
            self.vector_agent._log_trace("ORCHESTRATOR", "No specific entity ID extracted.")
        
        # 3. Traverse Graph
        graph_nodes = []
        if entity_id:
            graph_nodes = self.graph_agent.execute(entity_id)
            
        # 4. Synthesize
        answer, requires_action = self.synthesis_agent.execute(docs, graph_nodes, query, entity_id)
        
        # 5. Determine Actions
        action = self.action_agent.execute(requires_action, entity_id)
        
        sources = docs + graph_nodes
        self.vector_agent._log_trace("ORCHESTRATOR", f"Pipeline complete. Yielding {len(sources)} sources and {1 if action else 0} action.")
        
        return answer, sources, action, list(self.traces)


def query_assistant(query: str):
    """Entry point for the FastAPI route."""
    orchestrator = Orchestrator()
    return orchestrator.execute_query(query)
