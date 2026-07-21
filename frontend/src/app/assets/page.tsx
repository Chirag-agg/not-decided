"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { StatusBadge, BadgeStatus } from "@/components/ui/StatusBadge";
import { config } from "@/utils/config";
import { fetchWithRetry } from "@/utils/api";

interface Asset {
  id: string;
  type: string;
  health: number;
  risk: number;
  lastMaint: string;
  status: string;
}

export default function AssetHealth() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetchWithRetry(`${config.apiBaseUrl}/api/assets`);
        if (res.ok) {
          const data = await res.json();
          setAssets(data);
        }
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="pb-4 border-b border-zinc-800 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Module // Health</div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Asset Intelligence Matrix</h2>
        </header>

        <div className="bg-zinc-900 border border-zinc-800">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950">
            <div>Asset ID</div>
            <div className="col-span-2">Equipment Type</div>
            <div>Health Score</div>
            <div>Failure Risk (7D)</div>
            <div>Last Maintenance</div>
          </div>
          
          <div className="divide-y divide-zinc-800 font-mono text-xs">
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Scanning graph for assets...</div>
            ) : assets.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No assets found in knowledge graph.</div>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-zinc-800/50 transition-colors">
                  <div className="font-semibold text-zinc-100">{asset.id}</div>
                  <div className="col-span-2 text-zinc-400">{asset.type}</div>
                  
                  {/* Health Bar */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 overflow-hidden">
                      <div 
                        className={`h-full ${asset.health < 70 ? 'bg-red-500' : asset.health < 85 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${asset.health}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{asset.health}%</span>
                  </div>

                  {/* Risk Badge */}
                  <div>
                    <StatusBadge status={asset.status as BadgeStatus} showIcon={false} />
                  </div>

                  <div className="text-zinc-500">{asset.lastMaint}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
