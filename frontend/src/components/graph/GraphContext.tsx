"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface GraphContextType {
  focusedNode: string | null;
  setFocusedNode: (nodeId: string | null) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export function GraphProvider({ children }: { children: ReactNode }) {
  const [focusedNode, setFocusedNode] = useState<string | null>(null);

  return (
    <GraphContext.Provider value={{ focusedNode, setFocusedNode }}>
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
