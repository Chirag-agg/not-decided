"use client";

import { Home, Database, Activity, FileText, Settings, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function Sidebar() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("VECTORIZING...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setUploadStatus("INGESTED [OK]");
      } else {
        setUploadStatus("ERR: FAILED");
      }
    } catch (err) {
      setUploadStatus("ERR: TIMEOUT");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus(null);
      }, 3000);
    }
  };

  return (
    <aside className="w-72 h-screen border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 font-sans relative z-20">
      <div className="p-6 border-b border-zinc-800 bg-zinc-900">
        <h1 className="text-zinc-100 font-bold tracking-wide text-xl flex items-center">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
          Industri<span className="text-zinc-500">AI</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-3">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-4 ml-2">MODULES</div>
        <Link href="/" className="flex items-center space-x-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 px-4 py-3 transition-colors border-l-2 border-transparent hover:border-zinc-500 font-semibold text-sm">
          <Home size={18} />
          <span>Dashboard</span>
        </Link>
        <Link href="/graph" className="flex items-center space-x-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 px-4 py-3 transition-colors border-l-2 border-transparent hover:border-zinc-500 font-semibold text-sm">
          <Database size={18} />
          <span>Knowledge Base</span>
        </Link>
        <Link href="/assets" className="flex items-center space-x-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 px-4 py-3 transition-colors border-l-2 border-transparent hover:border-zinc-500 font-semibold text-sm">
          <Activity size={18} />
          <span>Asset Health</span>
        </Link>
        <Link href="/compliance" className="flex items-center space-x-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 px-4 py-3 transition-colors border-l-2 border-transparent hover:border-zinc-500 font-semibold text-sm">
          <FileText size={18} />
          <span>Compliance</span>
        </Link>
      </nav>

      {/* Document Ingestion Dropzone */}
      <div className="p-4 border-t border-zinc-800">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-2">DATA INGESTION</div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept=".pdf,.txt,.csv"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed transition-colors ${
            isUploading ? 'border-blue-500 bg-blue-950/30 text-blue-400' : 
            uploadStatus?.includes('OK') ? 'border-green-500 bg-green-950/30 text-green-400' :
            'border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800'
          }`}
        >
          <UploadCloud size={24} className="mb-3" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-center">
            {isUploading ? uploadStatus : uploadStatus || "UPLOAD MANUAL / LOG"}
          </span>
        </button>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <Link href="/settings" className="flex items-center space-x-4 text-zinc-500 hover:text-zinc-300 transition-colors px-4 py-2 font-semibold text-sm">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>

      {/* Live Data Ticker */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          INGESTION STREAM
        </div>
        <div className="h-16 overflow-hidden relative font-mono text-xs text-zinc-400">
          <div className="absolute w-full animate-[slideUp_6s_linear_infinite] flex flex-col space-y-2">
            <div className="truncate flex items-center"><span className="text-zinc-600 mr-2">0x1A</span> Vectorizing SOP-042...</div>
            <div className="truncate flex items-center text-blue-400"><span className="text-zinc-600 mr-2">0x1B</span> Linked WO-102 to PMP-101</div>
            <div className="truncate flex items-center"><span className="text-zinc-600 mr-2">0x1C</span> Parsing INC-24-005...</div>
            <div className="truncate flex items-center text-green-400"><span className="text-zinc-600 mr-2">0x1D</span> Embeddings updated</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center space-x-3 px-2 py-1.5 text-sm transition-colors ${
        active 
          ? "bg-zinc-800 text-zinc-100 font-medium" 
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      <div className={`${active ? "text-zinc-100" : "text-zinc-500"}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
