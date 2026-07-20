"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import useMeasure from "react-use-measure";
import { useGraphContext } from "./GraphContext";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
      Initializing Physics Engine...
    </div>
  ),
});

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();
  
  const [ref, bounds] = useMeasure();
  const { focusedNode } = useGraphContext();

  useEffect(() => {
    if (focusedNode && fgRef.current && graphData.nodes.length > 0) {
      const node = graphData.nodes.find((n: any) => n.id === focusedNode || n.label === focusedNode);
      if (node) {
        // @ts-ignore
        fgRef.current.centerAt(node.x, node.y, 1000);
        // @ts-ignore
        fgRef.current.zoom(3, 2000);
      }
    }
  }, [focusedNode, graphData]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/graph");
        const data = await res.json();
        if (data.edges && !data.links) {
          data.links = data.edges;
        }
        setGraphData(data);
      } catch (error) {
        console.error("Error fetching graph data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraph();
  }, []);

  // Muted, professional color palette
  const getNodeColor = (group: string) => {
    switch (group) {
      case "Equipment": return "#60a5fa"; // Blue-400
      case "Document": return "#4ade80"; // Green-400
      case "Incident": return "#f87171"; // Red-400
      case "WorkOrder": return "#fbbf24"; // Amber-400
      default: return "#a1a1aa";
    }
  };

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 10 / globalScale;
    ctx.font = `${fontSize}px monospace`;
    
    const nodeColor = getNodeColor(node.group);
    
    // Draw Node Square instead of Circle for a more structured look
    const size = 6;
    ctx.fillStyle = nodeColor;
    ctx.fillRect(node.x - size/2, node.y - size/2, size, size);
    
    // Draw Text Label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#a1a1aa'; // Muted text
    ctx.fillText(label, node.x, node.y + 6);
  }, []);

  return (
    <div className="w-full h-full relative bg-[#09090b]" ref={ref}>
      {/* Grid background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="absolute top-4 left-4 z-10 flex space-x-3 text-[9px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950/80 px-2 py-1 border border-zinc-800">
        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-400 mr-1.5"></span> Equipment</span>
        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-400 mr-1.5"></span> Manuals</span>
        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-red-400 mr-1.5"></span> Incidents</span>
        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-amber-400 mr-1.5"></span> Work Orders</span>
      </div>
      
      {!loading && graphData.nodes.length > 0 && bounds.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={bounds.width}
          height={bounds.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkColor={() => "#27272a"} // Zinc-800
          linkWidth={1}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={(link) => getNodeColor((link.target as any).group || "Equipment")}
          onNodeClick={(node) => {
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
