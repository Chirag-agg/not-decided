"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { StatusBadge, BadgeStatus } from "@/components/ui/StatusBadge";
import { config } from "@/utils/config";
import { fetchWithRetry } from "@/utils/api";

interface ComplianceRule {
  id: string;
  desc: string;
  status: string;
  date: string;
  owner: string;
  reasons: string[];
  entities: string[];
}

export default function Compliance() {
  const [complianceItems, setComplianceItems] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        const res = await fetchWithRetry(`${config.apiBaseUrl}/api/compliance`);
        if (res.ok) {
          const data = await res.json();
          setComplianceItems(data);
        }
      } catch (err) {
        console.error("Failed to fetch compliance data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompliance();
  }, []);

  const generateEvidence = (rule: ComplianceRule) => {
    const text = `EVIDENCE PACKAGE\n----------------\nRule: ${rule.id} - ${rule.desc}\nStatus: ${rule.status}\nOwner: ${rule.owner}\nDate: ${rule.date}\n\nAffected Entities:\n${rule.entities.length > 0 ? rule.entities.join(", ") : "None"}\n\nDetection Reasons:\n${rule.reasons.map(r => "- " + r).join("\n")}\n\nThis package was auto-generated from the live Knowledge Graph.`;
    alert(text);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="pb-4 border-b border-zinc-800 mb-8 flex justify-between items-end">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Module // Compliance</div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Regulatory QMS Audits</h2>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {loading ? "Evaluating graph topology..." : "Live Evaluation Complete"}
          </div>
        </header>

        <div className="bg-zinc-900 border border-zinc-800">
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950 items-center">
            <div className="col-span-1">Standard</div>
            <div className="col-span-2">Description</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Detected Reasons</div>
            <div className="col-span-1 text-right">Audit Action</div>
          </div>
          
          <div className="divide-y divide-zinc-800 font-mono text-xs">
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Running compliance engine against live graph...</div>
            ) : complianceItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No active rules found.</div>
            ) : (
              complianceItems.map((item) => (
                <div key={item.id} className="grid grid-cols-7 gap-4 p-4 items-start hover:bg-zinc-800/50 transition-colors">
                  <div className="font-semibold text-zinc-100 col-span-1">{item.id}</div>
                  <div className="col-span-2 text-zinc-400 leading-relaxed pr-4">{item.desc}</div>
                  
                  {/* Status Badge */}
                  <div className="col-span-1">
                    <StatusBadge status={item.status as BadgeStatus} showIcon={true} />
                  </div>

                  {/* Reasons */}
                  <div className="col-span-2 text-zinc-500">
                    <ul className="list-disc list-inside space-y-1">
                      {item.reasons.map((r, i) => (
                        <li key={i} className="truncate" title={r}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 text-right flex justify-end">
                    <button 
                      onClick={() => generateEvidence(item)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Gen Evidence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
