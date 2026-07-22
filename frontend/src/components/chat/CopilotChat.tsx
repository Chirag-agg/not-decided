"use client";

import { useState } from "react";
import { Send, Terminal, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGraphContext } from "@/components/graph/GraphContext";
import DOMPurify from "isomorphic-dompurify";
import { config } from "@/utils/config";
import { CONSTANTS } from "@/utils/constants";
import { fetchWithRetry } from "@/utils/api";

interface Message {
  role: "user" | "bot";
  content: string;
  sources?: string[];
  action?: string | null;
  traces?: string[];
  matched_entity_id?: string | null;
}

export default function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "SYSTEM INITIALIZED.\nKeystone Knowledge Base connected. Awaiting query...",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTraces, setActiveTraces] = useState<string[]>([]);
  const [isSimulatingTraces, setIsSimulatingTraces] = useState(false);
  const [showWoModal, setShowWoModal] = useState(false);
  const [woStatus, setWoStatus] = useState<"idle" | "saving" | "success">("idle");
  const [isListening, setIsListening] = useState(false);
  const { setFocusedNode } = useGraphContext();

  const handleSpeech = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInput(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const sendMessage = async () => {
    if (!input.trim() || isSimulatingTraces) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setActiveTraces([]);
    setWoStatus("idle"); // Reset status

    try {
      const res = await fetchWithRetry(`${config.apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content }),
      });
      
      const data = await res.json();
      
      setIsLoading(false);
      
      // Simulate streaming traces
      if (data.traces && data.traces.length > 0) {
        setIsSimulatingTraces(true);
        for (let i = 0; i < data.traces.length; i++) {
          await new Promise(resolve => setTimeout(resolve, CONSTANTS.TIMEOUTS.AGENT_TRACE_DELAY));
          setActiveTraces(prev => [...prev, data.traces[i]]);
        }
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.TIMEOUTS.AGENT_TRACE_DELAY));
        setIsSimulatingTraces(false);
        setActiveTraces([]);
      }
      
      // Auto-focus node if mentioned dynamically
      if (data.matched_entity_id) {
        setFocusedNode(data.matched_entity_id);
      }
      
      setMessages((prev) => [
        ...prev, 
        { role: "bot", content: data.answer, sources: data.sources, action: data.action, traces: data.traces, matched_entity_id: data.matched_entity_id }
      ]);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "ERR: Connection to knowledge base timed out." }
      ]);
    }
  };

  const handleApproveWo = async () => {
    setWoStatus("saving");
    await new Promise(resolve => setTimeout(resolve, CONSTANTS.TIMEOUTS.ERP_SAVE_SIMULATION)); // Simulate ERP save
    setWoStatus("success");
    await new Promise(resolve => setTimeout(resolve, CONSTANTS.TIMEOUTS.ERP_SUCCESS_DISPLAY));
    setShowWoModal(false);
    
    // Add success message to chat
    setMessages((prev) => [
      ...prev, 
      { role: "bot", content: "SYS: Work Order WO-105-B successfully dispatched to SAP-HANA." }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-canvas relative">
      <div className="p-3 border-b border-structural bg-surface/50 flex justify-between items-center">
        <div className="text-[10px] font-sans uppercase tracking-widest text-secondary-text flex items-center font-semibold">
          <Terminal size={12} className="mr-2" />
          Agentic Workspace
        </div>
        <div className="text-[10px] font-sans uppercase tracking-widest text-nominal font-semibold">
          Ready
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm relative pb-28">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              key={idx} 
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-sans uppercase tracking-widest text-secondary-text font-semibold">
                  {msg.role === "user" ? "OPERATOR" : "AI ASSISTANT"}
                </span>
              </div>
              <div className={`p-4 max-w-[90%] shadow-lg ${msg.role === "user" ? "bg-surface border-r-4 border-accent text-primary-text" : "bg-surface border-l-4 border-structural text-primary-text"}`}>
                
                {/* Historical Traces Log */}
                {msg.traces && msg.traces.length > 0 && (
                  <div className="mb-3 pb-2 border-b border-structural/50">
                    <div className="text-[10px] font-sans uppercase tracking-widest text-accent mb-1 font-semibold">Diagnostics:</div>
                    {msg.traces.map((trace, tIdx) => (
                      <div key={tIdx} className="text-[10px] font-mono text-secondary-text truncate leading-relaxed">
                        &gt; {trace}
                      </div>
                    ))}
                  </div>
                )}
                
                <p 
                  className="whitespace-pre-wrap leading-relaxed text-sm" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }} 
                />
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-structural/50 flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-mono uppercase tracking-widest font-semibold bg-canvas border border-structural text-secondary-text px-2 py-1">
                        REF: {src}
                      </span>
                    ))}
                  </div>
                )}
                
                {msg.action && (
                  <div className="mt-4 pt-3 border-t border-structural/50">
                    <button 
                      onClick={() => setShowWoModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-canvas border border-accent/50 hover:border-accent hover:bg-accent/10 text-accent font-semibold py-3 px-4 transition-colors"
                    >
                      <Terminal size={18} />
                      <span className="text-xs font-sans uppercase tracking-widest">Execute: Gen Work Order</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live Traces Simulation */}
        {(isLoading || isSimulatingTraces) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start mt-4">
            <div className="text-[10px] font-sans uppercase tracking-widest text-accent mb-2 flex items-center font-semibold">
              <span className="w-2 h-2 bg-accent mr-2 animate-pulse shadow-[0_0_8px_#3FC1C9]"></span>
              EXECUTING AGENTIC PIPELINE...
            </div>
            {activeTraces.map((trace, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-secondary-text mb-1 font-mono pl-3 border-l-2 border-structural"
              >
                &gt; {trace}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Work Order Modal */}
        <AnimatePresence>
          {showWoModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-canvas/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-surface border border-structural w-full max-w-md shadow-2xl flex flex-col"
              >
                <div className="p-3 border-b border-structural flex justify-between items-center bg-canvas">
                  <div className="text-[10px] font-sans uppercase tracking-widest text-secondary-text font-semibold">
                    Draft // Preventive Maintenance
                  </div>
                  <button onClick={() => setShowWoModal(false)} className="text-secondary-text hover:text-primary-text uppercase text-[10px] font-sans font-semibold tracking-widest">
                    [CLOSE]
                  </button>
                </div>
                
                <div className="p-4 space-y-4 text-xs font-sans">
                  <div className="flex justify-between border-b border-structural pb-2">
                    <span className="text-secondary-text font-semibold uppercase">Target Asset:</span>
                    <span className="text-primary-text font-mono">PMP-101 (Main Cooling)</span>
                  </div>
                  <div className="flex justify-between border-b border-structural pb-2">
                    <span className="text-secondary-text font-semibold uppercase">Priority:</span>
                    <span className="text-alarm font-semibold uppercase tracking-widest bg-alarm/10 px-1 border border-alarm/30">CRITICAL</span>
                  </div>
                  <div className="space-y-2 border-b border-structural pb-3">
                    <span className="text-secondary-text font-semibold uppercase block">Recommended Actions:</span>
                    <div className="pl-2 border-l border-structural text-primary-text space-y-1">
                      <p>1. Lockout/Tagout PMP-101.</p>
                      <p>2. Inspect drive-side bearings for wear.</p>
                      <p>3. Apply ISO-VG 46 synthetic lubricant.</p>
                      <p>4. Measure post-lube vibration baseline.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-canvas border-t border-structural">
                  <button 
                    onClick={handleApproveWo}
                    disabled={woStatus !== "idle"}
                    className="w-full bg-primary-text hover:bg-white text-canvas font-semibold py-2 transition-colors uppercase tracking-widest text-[10px] flex justify-center items-center"
                  >
                    {woStatus === "idle" && "Approve & Dispatch"}
                    {woStatus === "saving" && <><span className="w-1.5 h-1.5 bg-canvas animate-ping mr-2"></span> Transmitting Payload...</>}
                    {woStatus === "success" && "DISPATCHED [OK]"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-canvas border-t border-structural">
          <div className="relative flex items-center bg-surface border border-structural focus-within:border-accent transition-colors overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading || isSimulatingTraces}
              placeholder={isListening ? "Listening..." : "Enter command or query..."}
              className="w-full bg-transparent text-primary-text font-sans text-sm pl-4 pr-24 py-4 outline-none placeholder:text-secondary-text disabled:opacity-50"
            />
            <div className="absolute right-2 flex items-center space-x-2">
              <button 
                onClick={handleSpeech}
                disabled={isLoading || isSimulatingTraces}
                className={`p-2 border transition-colors ${
                  isListening 
                    ? 'border-alarm bg-alarm/20 text-alarm animate-pulse' 
                    : 'border-structural bg-canvas text-secondary-text hover:border-secondary-text hover:text-primary-text disabled:opacity-30'
                }`}
                title="Voice Command"
              >
                <Mic size={20} />
              </button>
              <button 
                onClick={sendMessage}
                disabled={isLoading || isSimulatingTraces || !input.trim()}
                className="p-2 border border-accent bg-accent/10 text-accent hover:bg-accent/20 disabled:border-structural disabled:bg-surface disabled:text-secondary-text transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
