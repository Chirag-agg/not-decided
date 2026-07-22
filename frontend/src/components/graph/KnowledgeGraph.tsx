"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import useMeasure from "react-use-measure";
import { useGraphContext } from "./GraphContext";
import { config } from "@/utils/config";
import { CONSTANTS } from "@/utils/constants";
import { fetchWithRetry } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X, Info } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm font-sans text-secondary-text">
      Initializing engine...
    </div>
  ),
});

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();
  
  const [ref, bounds] = useMeasure();
  const { focusedNode, refreshGraphTrigger, pulseTrigger } = useGraphContext();
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [pulseActive, setPulseActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentNodes, setRecentNodes] = useState<Set<string>>(new Set());

  // Precompute neighbors for fast lookup
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    graphData.links.forEach((link: any) => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;
      if (!map.has(source)) map.set(source, new Set());
      if (!map.has(target)) map.set(target, new Set());
      map.get(source)?.add(target);
      map.get(target)?.add(source);
    });
    return map;
  }, [graphData.links]);

  useEffect(() => {
    if (focusedNode && fgRef.current && graphData.nodes.length > 0) {
      const node = graphData.nodes.find((n: any) => n.id === focusedNode || n.label === focusedNode);
      if (node) {
        // @ts-ignore
        fgRef.current.centerAt(node.x, node.y, 1000);
        // @ts-ignore
        fgRef.current.zoom(3, 2000);
        setSelectedNode(node);
      }
    }
  }, [focusedNode, graphData]);

  // Pulse animation trigger
  useEffect(() => {
    if (pulseTrigger > 0) {
      setPulseActive(true);
      const t = setTimeout(() => setPulseActive(false), 2000);
      return () => clearTimeout(t);
    }
  }, [pulseTrigger]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetchWithRetry(`${config.apiBaseUrl}/api/graph`);
        const data = await res.json();
        if (data.edges && !data.links) {
          data.links = data.edges;
        }
        
        // Safely access current state via the setGraphData callback
        setGraphData((current) => {
          const existingNodeIds = new Set(current.nodes.map((n: any) => n.id));
          
          let newlyAddedIds: string[] = [];
          
          // Mutate the incoming data to add jitter to completely new nodes
          data.nodes.forEach((node: any) => {
            if (!existingNodeIds.has(node.id)) {
              // Give it a strong random jitter so it doesn't equilibrium trap at 0,0
              node.x = (Math.random() - 0.5) * 200;
              node.y = (Math.random() - 0.5) * 200;
              newlyAddedIds.push(node.id);
            }
          });
          
          // If we actually added new nodes to a populated graph, make them glow
          if (newlyAddedIds.length > 0 && current.nodes.length > 0) {
            setRecentNodes(new Set(newlyAddedIds));
            // Remove the glow after 10 seconds
            setTimeout(() => {
              setRecentNodes(new Set());
            }, 10000);
          }
          
          return data; // Return the mutated raw data
        });

        // Reheat the simulation so it pushes the new nodes into place
        setTimeout(() => {
          if (fgRef.current) {
            // @ts-ignore
            fgRef.current.d3ReheatSimulation();
          }
        }, 100);

      } catch (error) {
        console.error("Error fetching graph data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraph();
  }, [refreshGraphTrigger]);

  const getNodeColor = (group: string) => {
    switch (group) {
      case "Equipment": return CONSTANTS.GRAPH_COLORS.EQUIPMENT;
      case "Document": return CONSTANTS.GRAPH_COLORS.DOCUMENT;
      case "Incident": return CONSTANTS.GRAPH_COLORS.INCIDENT;
      case "WorkOrder": return CONSTANTS.GRAPH_COLORS.WORK_ORDER;
      default: return CONSTANTS.GRAPH_COLORS.DEFAULT;
    }
  };

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const activeNodeId = focusedNode || hoverNode?.id || selectedNode?.id;
    const isFocused = node.id === focusedNode || node.id === selectedNode?.id;
    
    let isNeighbor = false;
    let isActive = false;
    
    if (activeNodeId) {
      isActive = node.id === activeNodeId || node.label === activeNodeId;
      isNeighbor = neighbors.get(activeNodeId)?.has(node.id) || false;
      
      // If there's an active node, and this is neither active nor neighbor, dim it
      if (!isActive && !isNeighbor) {
        ctx.globalAlpha = 0.2;
      }
    }

    const nodeColor = getNodeColor(node.group);
    
    // Draw Node
    const size = 6;
    
    if (isFocused) {
      // Draw pulsing accent ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'transparent';
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeStyle = CONSTANTS.GRAPH_COLORS.ACCENT;
      ctx.stroke();
    } else if (recentNodes.has(node.id)) {
      // Draw glowing accent ring for newly ingested nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = CONSTANTS.GRAPH_COLORS.ACCENT + '30'; // 20% opacity glow
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 1.2, 0, 2 * Math.PI, false);
      ctx.strokeStyle = CONSTANTS.GRAPH_COLORS.ACCENT;
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }
    
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size/2, 0, 2 * Math.PI, false);
    ctx.fill();
    
    // Always Draw Text Label (dimmed if not active)
    const label = node.label;
    const fontSize = 11 / globalScale;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CONSTANTS.GRAPH_COLORS.PRIMARY_TEXT || '#E8EAED';
    ctx.fillText(label, node.x, node.y + 6);
    
    ctx.globalAlpha = 1.0; // reset
  }, [focusedNode, hoverNode, selectedNode, neighbors, recentNodes]);

  return (
    <div className={`bg-canvas overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'relative w-full h-full'}`} ref={ref}>
      {/* Structural Grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(var(--color-structural) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      {/* Signature Ingestion Animation Pulse */}
      <AnimatePresence>
        {pulseActive && (
          <motion.div 
            initial={{ left: '-100%', opacity: 1 }}
            animate={{ left: '100%', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-1/2 h-1 bg-accent z-50 pointer-events-none w-64 shadow-[0_0_20px_#3FC1C9]"
          />
        )}
      </AnimatePresence>
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="p-2 bg-surface border border-structural text-secondary-text hover:text-primary-text hover:border-secondary-text transition-colors shadow-lg"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2 text-[10px] font-sans uppercase tracking-widest text-secondary-text bg-surface px-4 py-3 border border-structural shadow-xl">
        <div className="font-semibold border-b border-structural pb-1 mb-1">LEGEND</div>
        <span className="flex items-center"><span className="w-2 h-2 mr-2" style={{ backgroundColor: CONSTANTS.GRAPH_COLORS.EQUIPMENT }}></span> Equipment (Nominal)</span>
        <span className="flex items-center"><span className="w-2 h-2 mr-2" style={{ backgroundColor: CONSTANTS.GRAPH_COLORS.DOCUMENT }}></span> Document</span>
        <span className="flex items-center"><span className="w-2 h-2 mr-2" style={{ backgroundColor: CONSTANTS.GRAPH_COLORS.INCIDENT }}></span> Incident (Alarm)</span>
        <span className="flex items-center"><span className="w-2 h-2 mr-2" style={{ backgroundColor: CONSTANTS.GRAPH_COLORS.WORK_ORDER }}></span> Work Order (Caution)</span>
      </div>
      
      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            className="absolute top-4 left-4 z-20 w-80 bg-surface border border-structural shadow-2xl flex flex-col max-h-[calc(100%-2rem)] overflow-hidden"
          >
            <div className="p-3 border-b border-structural flex justify-between items-center bg-canvas">
              <div className="text-[10px] font-sans uppercase tracking-widest text-accent font-semibold flex items-center">
                <Info size={12} className="mr-2" />
                Node Inspector
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-secondary-text hover:text-primary-text transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto font-sans text-sm text-primary-text space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-1">Identifier</div>
                <div className="font-mono text-xs">{selectedNode.id}</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-1">Label</div>
                <div className="font-semibold">{selectedNode.label}</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-1">Classification</div>
                <div className="inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-semibold border"
                     style={{ 
                       borderColor: getNodeColor(selectedNode.group), 
                       color: getNodeColor(selectedNode.group),
                       backgroundColor: `${getNodeColor(selectedNode.group)}15` 
                     }}>
                  {selectedNode.group}
                </div>
              </div>

              {/* Description */}
              {selectedNode.description && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-1">Description</div>
                  <div className="text-xs leading-relaxed text-secondary-text">{selectedNode.description}</div>
                </div>
              )}

              {/* Dynamic Properties */}
              {Object.entries(selectedNode).filter(([k]) => !['id', 'label', 'group', 'x', 'y', 'vx', 'vy', 'index', 'color', 'indexColor', '__indexColor', 'fx', 'fy', 'description', 'metrics'].includes(k)).length > 0 && (
                <div className="border-t border-structural pt-4 space-y-3">
                  <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-2">Properties</div>
                  {Object.entries(selectedNode)
                    .filter(([k]) => !['id', 'label', 'group', 'x', 'y', 'vx', 'vy', 'index', 'color', 'indexColor', '__indexColor', 'fx', 'fy', 'description', 'metrics'].includes(k))
                    .map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">{key.replace(/_/g, ' ')}</div>
                      <div className="font-mono text-xs">{String(value)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Metrics */}
              {selectedNode.metrics && (
                <div className="border-t border-structural pt-4 space-y-3">
                  <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-2">Live Metrics</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedNode.metrics).map(([key, value]) => (
                      <div key={key} className="bg-canvas border border-structural p-2">
                        <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">{key}</div>
                        <div className="font-mono text-accent text-xs">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t border-structural pt-4">
                <div className="text-[10px] uppercase tracking-widest text-secondary-text mb-2">Connected Entities ({neighbors.get(selectedNode.id)?.size || 0})</div>
                <div className="space-y-2">
                  {Array.from(neighbors.get(selectedNode.id) || []).map((neighborId, idx) => {
                    const nNode = graphData.nodes.find((n: any) => n.id === neighborId);
                    if (!nNode) return null;

                    const link = graphData.links.find((l: any) => 
                      (l.source?.id === selectedNode.id && l.target?.id === neighborId) ||
                      (l.target?.id === selectedNode.id && l.source?.id === neighborId) ||
                      (l.source === selectedNode.id && l.target === neighborId) ||
                      (l.target === selectedNode.id && l.source === neighborId)
                    );
                    
                    const relationship = (link as any)?.relationship || "connected_to";
                    const isSource = (link as any)?.source === selectedNode.id || (link as any)?.source?.id === selectedNode.id;

                    return (
                      <div key={idx} className="flex flex-col border border-structural bg-canvas hover:bg-surface/80 cursor-pointer transition-colors"
                           onClick={() => {
                             setSelectedNode(nNode);
                             // @ts-ignore
                             fgRef.current?.centerAt(nNode.x, nNode.y, 1000);
                           }}>
                        <div className="px-2 py-1 bg-surface/50 border-b border-structural flex items-center space-x-2 text-[9px] font-mono text-secondary-text">
                            <span className="uppercase tracking-widest text-secondary-text">{isSource ? 'OUTBOUND' : 'INBOUND'}</span>
                            <span className="text-primary-text font-semibold">{relationship}</span>
                        </div>
                        <div className="p-2 flex justify-between items-center">
                            <span className="font-mono text-[10px] truncate max-w-[70%] text-primary-text">{nNode.label}</span>
                            <span className="text-[9px] uppercase tracking-widest text-secondary-text">{nNode.group}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
          <div className="text-[12px] font-sans uppercase tracking-widest text-secondary-text animate-pulse">
            Querying graph...
          </div>
        </div>
      ) : null}
      
      {!loading && graphData.nodes.length > 0 && bounds.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={isFullscreen && typeof window !== "undefined" ? window.innerWidth : bounds.width}
          height={isFullscreen && typeof window !== "undefined" ? window.innerHeight : bounds.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkColor={() => CONSTANTS.GRAPH_COLORS.LINK}
          linkWidth={(link) => {
            const activeNodeId = focusedNode || hoverNode?.id || selectedNode?.id;
            if (activeNodeId) {
              const src = typeof link.source === 'object' ? link.source.id : link.source;
              const tgt = typeof link.target === 'object' ? link.target.id : link.target;
              if (src === activeNodeId || tgt === activeNodeId) return 2;
            }
            return 1;
          }}
          onNodeHover={setHoverNode}
          onNodeClick={(node) => {
            setSelectedNode(node);
            // @ts-ignore
            if (fgRef.current) {
              // @ts-ignore
              fgRef.current.centerAt(node.x, node.y, 1000);
              // @ts-ignore
              fgRef.current.zoom(3, 2000);
            }
          }}
          backgroundColor="transparent"
        />
      )}
    </div>
  );
}
