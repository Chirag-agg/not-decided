"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GraphContextType {
  focusedNode: string | null;
  setFocusedNode: (nodeId: string | null) => void;
  refreshGraphTrigger: number;
  triggerGraphRefresh: () => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export function GraphProvider({ children }: { children: ReactNode }) {
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [refreshGraphTrigger, setRefreshGraphTrigger] = useState<number>(0);

  const triggerGraphRefresh = () => {
    setRefreshGraphTrigger(prev => prev + 1);
  };

  return (
    <GraphContext.Provider value={{ focusedNode, setFocusedNode, refreshGraphTrigger, triggerGraphRefresh }}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraphContext() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraphContext must be used within a GraphProvider");
  }
  return context;
}
