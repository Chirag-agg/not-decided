"use client";

import { useState } from "react";
import { Send, Terminal, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGraphContext } from "@/components/graph/GraphContext";

interface Message {
  role: "user" | "bot";
  content: string;
  sources?: string[];
  action?: string | null;
  traces?: string[];
}

export default function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "SYSTEM INITIALIZED.\nIndustrial Knowledge Base connected. Awaiting query...",
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
      const res = await fetch("http://localhost:8000/api/chat", {
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
          await new Promise(resolve => setTimeout(resolve, 300));
          setActiveTraces(prev => [...prev, data.traces[i]]);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsSimulatingTraces(false);
        setActiveTraces([]);
      }
      
      // Auto-focus node if mentioned
      if (data.answer.includes("PMP-101")) {
        setFocusedNode("PMP-101");
      }
      
      setMessages((prev) => [
        ...prev, 
        { role: "bot", content: data.answer, sources: data.sources, action: data.action, traces: data.traces }
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
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate ERP save
    setWoStatus("success");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowWoModal(false);
    
    // Add success message to chat
    setMessages((prev) => [
      ...prev, 
      { role: "bot", content: "SYS: Work Order WO-105-B successfully dispatched to SAP-HANA." }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative">
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center">
          <Terminal size={12} className="mr-2" />
          Agentic Workspace
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-green-500">
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  {msg.role === "user" ? "OPERATOR" : "AI ASSISTANT"}
                </span>
              </div>
              <div className={`p-4 max-w-[90%] shadow-lg ${msg.role === "user" ? "bg-zinc-800 border-r-4 border-blue-500 text-zinc-100" : "bg-zinc-900 border-l-4 border-zinc-500 text-zinc-100"}`}>
                
                {/* Historical Traces Log (collapsed or minimal) */}
                {msg.traces && msg.traces.length > 0 && (
                  <div className="mb-3 pb-2 border-b border-zinc-700/50">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-1 font-bold">Diagnostics:</div>
                    {msg.traces.map((trace, tIdx) => (
                      <div key={tIdx} className="text-[11px] font-mono text-zinc-400 truncate leading-relaxed">
                        &gt; {trace}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/50 flex flex-wrap gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-mono uppercase tracking-widest font-bold bg-zinc-950 border border-zinc-700 text-zinc-400 px-2 py-1">
                        REF: {src}
                      </span>
                    ))}
                  </div>
                )}
                
                {msg.action && (
                  <div className="mt-4 pt-3 border-t border-zinc-700/50">
                    <button 
                      onClick={() => setShowWoModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-zinc-950 border border-green-500/50 hover:border-green-400 hover:bg-green-950/30 text-green-400 font-bold py-3 px-4 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                    >
                      <Terminal size={18} />
                      <span className="text-xs font-mono uppercase tracking-widest">Execute: Gen Work Order</span>
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-2 flex items-center font-bold">
              <span className="w-2 h-2 bg-blue-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              EXECUTING AGENTIC PIPELINE...
            </div>
            {activeTraces.map((trace, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] text-zinc-400 mb-1 font-mono pl-3 border-l-2 border-zinc-700"
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
              className="absolute inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-zinc-900 border border-zinc-700 w-full max-w-md shadow-2xl flex flex-col"
              >
                <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    Draft // Preventive Maintenance
                  </div>
                  <button onClick={() => setShowWoModal(false)} className="text-zinc-500 hover:text-zinc-100 uppercase text-[10px] tracking-widest">
                    [CLOSE]
                  </button>
                </div>
                
                <div className="p-4 space-y-4 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 uppercase">Target Asset:</span>
                    <span className="text-zinc-100">PMP-101 (Main Cooling)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 uppercase">Priority:</span>
                    <span className="text-red-400 uppercase tracking-widest bg-red-950 px-1 border border-red-900">CRITICAL</span>
                  </div>
                  <div className="space-y-2 border-b border-zinc-800 pb-3">
                    <span className="text-zinc-500 uppercase block">Recommended Actions:</span>
                    <div className="pl-2 border-l border-zinc-700 text-zinc-300 space-y-1">
                      <p>1. Lockout/Tagout PMP-101.</p>
                      <p>2. Inspect drive-side bearings for wear.</p>
                      <p>3. Apply ISO-VG 46 synthetic lubricant.</p>
                      <p>4. Measure post-lube vibration baseline.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                  <button 
                    onClick={handleApproveWo}
                    disabled={woStatus !== "idle"}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold py-2 transition-colors uppercase tracking-widest text-[10px] flex justify-center items-center"
                  >
                    {woStatus === "idle" && "Approve & Dispatch to SAP-HANA"}
                    {woStatus === "saving" && <><span className="w-1.5 h-1.5 bg-zinc-900 animate-ping mr-2"></span> Transmitting Payload...</>}
                    {woStatus === "success" && "DISPATCHED [OK]"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-zinc-950 border-t border-zinc-800 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="relative flex items-center bg-zinc-900 border-2 border-zinc-700 focus-within:border-blue-500 transition-colors shadow-inner overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading || isSimulatingTraces}
              placeholder={isListening ? "LISTENING..." : "ENTER COMMAND OR QUERY..."}
              className="w-full bg-transparent text-zinc-100 font-mono text-sm pl-4 pr-24 py-4 outline-none placeholder:text-zinc-500 disabled:opacity-50 uppercase"
            />
            <div className="absolute right-2 flex items-center space-x-2">
              <button 
                onClick={handleSpeech}
                disabled={isLoading || isSimulatingTraces}
                className={`p-2 border transition-colors ${
                  isListening 
                    ? 'border-red-500 bg-red-950/50 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-30'
                }`}
                title="Voice Command"
              >
                <Mic size={20} />
              </button>
              <button 
                onClick={sendMessage}
                disabled={isLoading || isSimulatingTraces || !input.trim()}
                className="p-2 border border-blue-500 bg-blue-900/30 text-blue-400 hover:bg-blue-900/60 hover:text-blue-300 disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
