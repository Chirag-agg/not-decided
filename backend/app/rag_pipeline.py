import random
import requests
from typing import List, Tuple, Optional, Any, Dict
from .config import settings
from .utils.logger import get_logger
from .utils.cache import cache
from .knowledge_graph import build_knowledge_graph

logger = get_logger(__name__)

class BaseAgent:
    def __init__(self, trace_log: List[str]):
        self.trace_log = trace_log

    def _log_trace(self, agent_name: str, action: str):
        msg = f"[{agent_name}] {action}"
        self.trace_log.append(msg)
        logger.info(msg)


class DocumentRetrievalAgent(BaseAgent):
    """
    Retrieves connected documents by walking graph edges.
    Renamed from VectorSearchAgent because there is no actual vector DB.
    """
    def execute(self, entity_id: Optional[str], graph_data: dict) -> List[str]:
        if not entity_id:
            return []
            
        self._log_trace("SYS_AGENT_SEARCH", f"Mock Vector Search: Querying graph for documents related to {entity_id}")
        
        related_docs = []
        for link in graph_data.get("links", []):
            if link["source"] == entity_id or link["target"] == entity_id:
                neighbor_id = link["target"] if link["source"] == entity_id else link["source"]
                # Verify if neighbor is a Document
                neighbor_node = next((n for n in graph_data.get("nodes", []) if n["id"] == neighbor_id), None)
                if neighbor_node and neighbor_node.get("group") == "Document":
                    related_docs.append(neighbor_id)
                    
        if related_docs:
            self._log_trace("SYS_AGENT_SEARCH", f"Found {len(related_docs)} related documents.")
        else:
            self._log_trace("SYS_AGENT_SEARCH", f"No specific document vectors matched for {entity_id}.")
            
        return related_docs


class GraphTraversalAgent(BaseAgent):
    def execute(self, entity_id: Optional[str], graph_data: dict) -> List[str]:
        if not entity_id:
            return []
            
        self._log_trace("SYS_AGENT_GRAPH", f"Traversing knowledge graph for entity: {entity_id}")
        
        related_nodes = []
        for link in graph_data.get("links", []):
            if link["source"] == entity_id or link["target"] == entity_id:
                neighbor_id = link["target"] if link["source"] == entity_id else link["source"]
                neighbor_node = next((n for n in graph_data.get("nodes", []) if n["id"] == neighbor_id), None)
                if neighbor_node and neighbor_node.get("group") != "Document":
                    related_nodes.append(neighbor_id)
                    
        if related_nodes:
            self._log_trace("SYS_AGENT_GRAPH", f"Found graph neighbors: {', '.join(related_nodes)}")
        else:
            self._log_trace("SYS_AGENT_GRAPH", f"No non-document neighbors found for {entity_id}")
            
        return related_nodes


class SynthesisAgent(BaseAgent):
    def execute(self, context_docs: List[str], graph_nodes: List[str], query: str, entity_id: Optional[str], graph_data: dict) -> Tuple[str, bool]:
        self._log_trace("SYS_AGENT_SYNTH", "Fusing cross-modal context (Vectors + Graph)")
        
        if entity_id:
            entity_node = next((n for n in graph_data.get("nodes", []) if n["id"] == entity_id), {})
            entity_label = entity_node.get("label", entity_id)
            
            # Segregate graph nodes
            incidents = [n for n in graph_nodes if "INC-" in n]
            work_orders = [n for n in graph_nodes if "WO-" in n]
            
            incident_text = ", ".join(incidents) if incidents else "No incident history on record."
            wo_text = ", ".join(work_orders) if work_orders else "No related work orders."
            doc_text = ", ".join(context_docs) if context_docs else "No reference manuals found."
            
            prompt = (
                f"You are an Industrial AI Expert. A user asked: '{query}'.\n"
                f"Context: The equipment is {entity_id} ({entity_label}).\n"
                f"Related Documents: {doc_text}\n"
                f"Related Incidents: {incident_text}\n"
                f"Related Work Orders: {wo_text}\n"
                "Using only the context provided, write a highly professional, short technical diagnostic (3-4 sentences max). "
                "If no incidents or work orders exist, state that the equipment is operating normally and has no recent history."
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
                logger.warning(f"LLM generation failed: {str(e)}. Using cached heuristic.")
                self._log_trace("SYS_AGENT_SYNTH", "LLM generation failed. Using cached template.")
                
                if incidents:
                    answer = (
                        f"Based on the unified knowledge base, {entity_label} ({entity_id}) has a known history involving: {incident_text}. "
                        f"Reference manuals ({doc_text}) suggest checking recent work orders ({wo_text}). "
                        f"Given the historical graph data, I recommend a proactive inspection."
                    )
                else:
                    answer = (
                        f"I've checked the knowledge graph for {entity_label} ({entity_id}). "
                        f"There are no incidents on record for this equipment. All systems appear nominal. "
                        f"Relevant documents available: {doc_text}."
                    )
            return answer, len(incidents) > 0
        else:
            self._log_trace("SYS_AGENT_SYNTH", "Insufficient context for definitive diagnostic.")
            
            # Pick a few random equipment tags to suggest
            equip_nodes = [n["id"] for n in graph_data.get("nodes", []) if n.get("group") == "Equipment"]
            suggestions = random.sample(equip_nodes, min(3, len(equip_nodes))) if equip_nodes else ["PMP-101"]
            
            answer = (
                "I searched the unified knowledge base but couldn't identify the specific equipment you're referring to. "
                f"Please provide a specific equipment ID (for example: {', '.join(suggestions)}) so I can pull the relevant telemetry and graph context."
            )
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
        self.doc_agent = DocumentRetrievalAgent(self.traces)
        self.graph_agent = GraphTraversalAgent(self.traces)
        self.synthesis_agent = SynthesisAgent(self.traces)
        self.action_agent = ActionAgent(self.traces)

    def _extract_entity(self, query: str, graph_data: dict) -> Optional[str]:
        query_lower = query.lower()
        
        # Pass 1: Exact ID matches
        for node in graph_data.get("nodes", []):
            node_id = node["id"].lower()
            if node_id in query_lower:
                return node["id"]
                
        # Pass 2: Best label match (longest matching substring)
        best_match_id = None
        longest_match_len = 0
        
        for node in graph_data.get("nodes", []):
            label = node.get("label", "").lower()
            clean_label = label.split(":", 1)[-1].strip()
            
            # Enforce length > 4 to avoid matching tiny generic words
            if len(clean_label) > 4 and clean_label in query_lower:
                if len(clean_label) > longest_match_len:
                    longest_match_len = len(clean_label)
                    best_match_id = node["id"]
                    
        return best_match_id

    def execute_query(self, query: str) -> Tuple[str, List[str], Optional[str], List[str], Optional[str]]:
        self.traces.clear()
        
        # 0. Fetch Live Graph Context
        self.vector_agent._log_trace("ORCHESTRATOR", "Initializing query resolution pipeline.")
        graph_data = cache.get("knowledge_graph")
        if not graph_data:
            graph_data = build_knowledge_graph()
            cache.set("knowledge_graph", graph_data)
        
        # 1. Extract Entities from Live Graph
        entity_id = self._extract_entity(query, graph_data)
        if entity_id:
            self.doc_agent._log_trace("ORCHESTRATOR", f"Extracted Entity ID: {entity_id}")
        else:
            self.doc_agent._log_trace("ORCHESTRATOR", "No specific entity ID extracted.")
            
        # 2. Vector/Document Search
        doc_context = self.doc_agent.execute(entity_id, graph_data)
        
        # 3. Traverse Graph (Graph Edges -> Incidents/WOs)
        graph_nodes = self.graph_agent.execute(entity_id, graph_data)
            
        # 4. Synthesize
        answer, requires_action = self.synthesis_agent.execute(doc_context, graph_nodes, query, entity_id, graph_data)
        
        # 5. Determine Actions
        action = self.action_agent.execute(requires_action, entity_id)
        
        sources = docs + graph_nodes
        self.vector_agent._log_trace("ORCHESTRATOR", f"Pipeline complete. Yielding {len(sources)} sources and {1 if action else 0} action.")
        
        return answer, sources, action, list(self.traces), entity_id


def query_assistant(query: str):
    """Entry point for the FastAPI route."""
    orchestrator = Orchestrator()
    return orchestrator.execute_query(query)
