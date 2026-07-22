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
            className="fixed inset-0 z-[100] bg-canvas flex flex-col items-start justify-end p-8 font-mono text-xs text-secondary-text whitespace-pre-wrap"
          >
            {bootText}
            <span className="animate-pulse">_</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-canvas text-primary-text font-sans">
        <Sidebar />
        
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden max-w-full">
          {/* Header Ribbon */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-structural shrink-0">
            <div>
              <div className="text-[10px] font-sans font-semibold text-secondary-text uppercase tracking-widest mb-1">MODULE // DASHBOARD</div>
              <h2 className="text-3xl font-display font-semibold tracking-tight text-primary-text">Asset intelligence node</h2>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="flex items-center space-x-3 bg-surface px-4 py-2 border border-structural">
                <span className="w-2.5 h-2.5 bg-nominal shadow-[0_0_10px_#4ADE80]"></span>
                <span className="text-xs font-sans font-bold text-nominal uppercase tracking-widest">SYSTEM OPTIMAL</span>
              </div>
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <KpiCard label="KNOWLEDGE NODES" value="1,492" sub="DELTA +12 (7D)" state="nominal" />
            <KpiCard label="SYSTEM UPTIME" value="99.9%" sub="STABLE" state="nominal" />
            <KpiCard label="ACTIVE ALERTS" value="3" sub="REQUIRES ACTION" state="alarm" />
            <KpiCard label="COMPLIANCE INDEX" value="98.5%" sub="AUDIT PASSED" state="nominal" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full">
            {/* Left Column - Knowledge Graph & Telemetry */}
            <div className="hidden lg:flex flex-1 flex-col h-full gap-4 overflow-hidden">
              <div className="flex-1 bg-canvas border border-structural overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full p-3 border-b border-structural bg-surface/80 backdrop-blur-md z-10 flex justify-between items-center">
                  <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-secondary-text">Topology Map // Live</span>
                </div>
                <div className="flex-1 relative mt-10 h-[calc(100%-2.5rem)]">
                  <KnowledgeGraph />
                </div>
              </div>
              
              {/* Telemetry Stream */}
              <div className="h-40 shrink-0 bg-canvas border border-structural flex flex-col overflow-hidden">
                <div className="p-3 border-b border-structural bg-surface/80 backdrop-blur-md">
                  <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-secondary-text">IoT Telemetry // Real-time</span>
                </div>
                <TelemetryStream />
              </div>
            </div>
            
            {/* Right Column - Copilot */}
            <div className="w-full lg:w-[450px] shrink-0 flex flex-col h-full bg-canvas border border-structural overflow-hidden">
              <CopilotChat />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function KpiCard({ label, value, sub, state }: { label: string, value: string, sub: string, state: 'nominal' | 'alarm' | 'caution' }) {
  // Number gets color ONLY if alarm or caution. Nominal is primary-text.
  const valueColor = state === 'alarm' ? 'text-alarm' : state === 'caution' ? 'text-caution' : 'text-primary-text';
  
  return (
    <div className="p-5 bg-surface border border-structural flex flex-col">
      <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-secondary-text mb-2">{label}</p>
      <div className="flex items-baseline justify-between mt-auto">
        {/* Monospace for live numbers */}
        <h3 className={`text-4xl font-mono tracking-tight ${valueColor}`}>{value}</h3>
      </div>
      <p className={`mt-2 text-[10px] font-sans font-semibold tracking-widest uppercase ${state === 'alarm' ? 'text-alarm' : state === 'caution' ? 'text-caution' : 'text-secondary-text'}`}>{sub}</p>
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-[10px] leading-relaxed flex flex-col">
      {logs.map(log => (
        <div key={log.id} className={`${log.anomaly ? 'text-alarm bg-alarm/10' : 'text-secondary-text'}`}>
          {log.text}
        </div>
      ))}
    </div>
  );
}
