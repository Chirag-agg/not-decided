"use client";

import { Home, Database, Activity, FileText, Settings, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { config } from "@/utils/config";
import { CONSTANTS } from "@/utils/constants";
import { fetchWithRetry } from "@/utils/api";
import { useGraphContext } from "@/components/graph/GraphContext";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerGraphRefresh, triggerPulse } = useGraphContext();
  const pathname = usePathname();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Ingesting...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetchWithRetry(`${config.apiBaseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadStatus(`Ingested [OK] - ${data.nodes_added} nodes`);
        triggerGraphRefresh();
        triggerPulse(); // Trigger the signature animation overlay
      } else {
        setUploadStatus("ERR: Failed");
      }
    } catch (err) {
      setUploadStatus("ERR: Timeout");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus(null);
      }, CONSTANTS.TIMEOUTS.UPLOAD_SIMULATION);
    }
  };

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/graph", icon: Database, label: "Knowledge base" },
    { href: "/assets", icon: Activity, label: "Asset health" },
    { href: "/compliance", icon: FileText, label: "Compliance" }
  ];

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-structural p-4 shrink-0 w-full z-30">
        <h1 className="text-primary-text font-display font-semibold text-lg flex items-center">
          Keystone
        </h1>
        <nav className="flex space-x-5">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`${pathname === item.href ? "text-accent" : "text-secondary-text hover:text-primary-text"}`}>
              <item.icon size={20} />
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside id="sidebar-container" className="w-72 h-screen border-r border-structural bg-canvas hidden md:flex flex-col shrink-0 font-sans relative z-20">
        <div className="p-6 border-b border-structural bg-surface">
          <h1 className="text-primary-text font-display font-semibold text-xl flex items-center tracking-tight">
            Key<span className="text-secondary-text">stone</span>
          </h1>
        </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-2">
        <div className="text-[10px] font-sans uppercase tracking-widest text-secondary-text mb-4 ml-4 font-semibold">MODULES</div>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center space-x-4 px-4 py-2 transition-colors border-l-2 text-sm ${
                isActive 
                  ? "border-accent text-primary-text bg-surface" 
                  : "border-transparent text-secondary-text hover:text-primary-text hover:bg-surface/50"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-accent" : ""} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Document Ingestion Dropzone */}
      <div className="p-4 border-t border-structural">
        <div className="text-[10px] font-sans uppercase tracking-widest text-secondary-text mb-3 ml-2 font-semibold">DATA INGESTION</div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept=".pdf,.txt,.csv"
        />
        <button 
          id="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center p-6 border transition-colors ${
            isUploading ? 'border-accent bg-surface text-accent' : 
            uploadStatus?.includes('OK') ? 'border-nominal bg-surface text-nominal' :
            uploadStatus?.includes('ERR') ? 'border-alarm bg-surface text-alarm' :
            'border-structural hover:border-secondary-text text-secondary-text hover:text-primary-text bg-surface'
          }`}
        >
          <UploadCloud size={24} className="mb-3" />
          <span className="text-sm font-sans">
            {isUploading ? uploadStatus : uploadStatus || "Upload document"}
          </span>
        </button>
      </div>

      {/* Live Data Ticker */}
      <div className="p-4 bg-surface border-t border-structural">
        <div className="text-[10px] font-sans uppercase tracking-widest text-secondary-text font-semibold mb-3">
          INGESTION STREAM
        </div>
        <div className="h-16 overflow-hidden relative font-mono text-xs text-secondary-text">
          <div className="absolute w-full animate-[slideUp_6s_linear_infinite] flex flex-col space-y-2">
            <div className="truncate"><span className="text-structural mr-2">0x1A</span> Vectorizing SOP-042...</div>
            <div className="truncate"><span className="text-structural mr-2">0x1B</span> Linked WO-102 to PMP-101</div>
            <div className="truncate"><span className="text-structural mr-2">0x1C</span> Parsing INC-24-005...</div>
            <div className="truncate"><span className="text-structural mr-2">0x1D</span> Embeddings updated</div>
          </div>
        </div>
      </div>
    </aside>
    </>
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
