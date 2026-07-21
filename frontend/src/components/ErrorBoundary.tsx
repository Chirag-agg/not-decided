"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-zinc-950 text-zinc-100 font-mono p-4">
          <div className="border border-red-500/50 bg-red-950/20 p-8 flex flex-col items-center text-center max-w-lg">
            <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
            <h1 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">System Failure Detected</h1>
            <p className="text-sm text-zinc-400 mb-6">
              The application encountered a critical exception.
              <br />
              {this.state.error?.message}
            </p>
            <button
              className="px-4 py-2 bg-red-900/50 text-red-200 border border-red-700 hover:bg-red-900 transition-colors uppercase text-xs tracking-widest"
              onClick={() => this.setState({ hasError: false })}
            >
              Restart Subsystem
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
