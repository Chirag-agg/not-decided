"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import KnowledgeGraph from "@/components/graph/KnowledgeGraph";
import CopilotChat from "@/components/chat/CopilotChat";
import { motion, AnimatePresence } from "framer-motion";
import { CONSTANTS } from "@/utils/constants";

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [bootText, setBootText] = useState("");

  useEffect(() => {
    const bootSequence = [
      "INIT_KERNEL...",
      "LOADING_NEURAL_WEIGHTS [OK]",
      "ESTABLISHING_SECURE_LINK::SAP-HANA [OK]",
      "MOUNTING_VECTOR_DB [OK]",
      "BYPASSING_MAINFRAME...",
      "INDUSTRIAL_BRAIN_ONLINE."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * (CONSTANTS.TIMEOUTS.BOOT_SEQUENCE_DELAY_MAX - CONSTANTS.TIMEOUTS.BOOT_SEQUENCE_DELAY_MIN) + CONSTANTS.TIMEOUTS.BOOT_SEQUENCE_DELAY_MIN;
      setTimeout(() => {
        setBootText(prev => prev + line + "\n");
        if (index === bootSequence.length - 1) {
          setTimeout(() => setBooting(false), 500);
        }
      }, delay);
    });
  }, []);

  return (
    <>
      <AnimatePresence>
        {booting && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-start justify-end p-8 font-mono text-xs text-green-500 whitespace-pre-wrap"
          >
            {bootText}
            <span className="animate-pulse">_</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
        <Sidebar />
        
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden max-w-full">
          {/* Header Ribbon */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-zinc-800 shrink-0">
            <div>
              <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-1">MODULE // DASHBOARD</div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Asset Intelligence Node</h2>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 border border-zinc-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <span className="w-2.5 h-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest">SYSTEM OPTIMAL</span>
              </div>
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <KpiCard label="KNOWLEDGE NODES" value="1,492" sub="DELTA +12 (7D)" />
            <KpiCard label="SYSTEM UPTIME" value="99.9%" sub="STABLE" />
            <KpiCard label="ACTIVE ALERTS" value="3" sub="REQUIRES ACTION" urgent />
            <KpiCard label="COMPLIANCE INDEX" value="98.5%" sub="AUDIT PASSED" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full">
            {/* Left Column - Knowledge Graph & Telemetry */}
            <div className="hidden lg:flex flex-1 flex-col h-full gap-4 overflow-hidden">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full p-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-10 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">Topology Map // Live</span>
                </div>
                <div className="flex-1 relative mt-10 h-[calc(100%-2.5rem)]">
                  <KnowledgeGraph />
                </div>
              </div>
              
              {/* Telemetry Stream */}
              <div className="h-40 shrink-0 bg-zinc-950 border border-zinc-800 flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="p-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">IoT Telemetry // Real-time</span>
                </div>
                <TelemetryStream />
              </div>
            </div>
            
            {/* Right Column - Copilot */}
            <div className="w-full lg:w-[450px] shrink-0 flex flex-col h-full bg-zinc-950 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
              <CopilotChat />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function KpiCard({ label, value, sub, urgent = false }: { label: string, value: string, sub: string, urgent?: boolean }) {
  return (
    <div className={`p-5 bg-zinc-900 border-l-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col ${urgent ? 'border-l-red-500 border-t border-r border-b border-red-900/30' : 'border-l-green-500 border-t border-r border-b border-zinc-800'}`}>
      <p className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-500 mb-2">{label}</p>
      <div className="flex items-baseline justify-between mt-auto">
        <h3 className="text-4xl font-bold tracking-tight text-zinc-100">{value}</h3>
      </div>
      <p className={`mt-2 text-[11px] font-mono font-bold tracking-widest uppercase ${urgent ? 'text-red-500' : 'text-zinc-500'}`}>{sub}</p>
    </div>
  );
}

// Real-time IoT Matrix Effect Component
function TelemetryStream() {
  const [logs, setLogs] = useState<{id: number, text: string, anomaly: boolean}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      const isAnomaly = Math.random() > 0.95; // 5% chance of anomaly
      const vib = isAnomaly ? (4.5 + Math.random() * 1.5).toFixed(2) : (2.1 + Math.random() * 1.5).toFixed(2);
      const temp = (80 + Math.random() * 10).toFixed(1);
      const eq = Math.random() > 0.5 ? "PMP-101" : "MTR-501";
      
      const log = {
        id: id++,
        text: `[${new Date().toISOString().split('T')[1].slice(0,-1)}] [${eq}] VIB: ${vib} mm/s | TEMP: ${temp} °C ${isAnomaly ? '>> WARNING_EXCEEDANCE' : ''}`,
        anomaly: isAnomaly
      };
      
      setLogs(prev => {
        const newLogs = [...prev, log];
        if (newLogs.length > 50) newLogs.shift();
        return newLogs;
      });
    }, CONSTANTS.TIMEOUTS.TELEMETRY_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-[9px] leading-tight flex flex-col">
      {logs.map(log => (
        <div key={log.id} className={`${log.anomaly ? 'text-red-500 bg-red-950/30' : 'text-zinc-500'}`}>
          {log.text}
        </div>
      ))}
    </div>
  );
}
