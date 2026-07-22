"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { StatusBadge, BadgeStatus } from "@/components/ui/StatusBadge";
import { config } from "@/utils/config";
import { fetchWithRetry } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, FileText, Activity, AlertTriangle } from "lucide-react";

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
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);

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

  const openEvidence = (rule: ComplianceRule) => {
    setSelectedRule(rule);
    setEvidenceModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-canvas text-primary-text font-sans relative">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto relative z-0">
        <header className="pb-4 border-b border-structural mb-8 flex justify-between items-end">
          <div>
            <div className="text-[10px] font-sans font-semibold uppercase tracking-widest text-secondary-text mb-1">Module // Compliance</div>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-primary-text">Regulatory QMS Audits</h2>
          </div>
          <div className="text-xs text-secondary-text font-sans font-semibold uppercase tracking-widest flex items-center">
            {loading ? (
              <span className="flex items-center"><Activity size={12} className="mr-2 animate-pulse" /> Evaluating graph topology...</span>
            ) : (
              <span className="text-accent flex items-center"><ShieldAlert size={12} className="mr-2" /> Live Evaluation Complete</span>
            )}
          </div>
        </header>

        <div className="bg-surface border border-structural shadow-2xl relative z-10">
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-structural text-[10px] font-sans font-semibold uppercase tracking-widest text-secondary-text bg-canvas items-center sticky top-0 z-20">
            <div className="col-span-1">Standard</div>
            <div className="col-span-2">Description</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Detected Reasons</div>
            <div className="col-span-1 text-right">Audit Action</div>
          </div>
          
          <div className="divide-y divide-structural font-mono text-xs">
            {loading ? (
              <div className="p-12 text-center text-secondary-text font-sans text-sm animate-pulse">Running compliance engine against live graph...</div>
            ) : complianceItems.length === 0 ? (
              <div className="p-12 text-center text-secondary-text font-sans text-sm">No active rules found.</div>
            ) : (
              complianceItems.map((item) => (
                <div key={item.id} className="grid grid-cols-7 gap-4 p-4 items-start hover:bg-surface/50 transition-colors bg-surface group">
                  <div className="font-semibold text-primary-text col-span-1 flex items-center h-full">{item.id}</div>
                  <div className="col-span-2 text-secondary-text font-sans text-sm leading-relaxed pr-4 flex items-center h-full">{item.desc}</div>
                  
                  {/* Status Badge */}
                  <div className="col-span-1 flex items-center h-full">
                    <StatusBadge status={item.status as BadgeStatus} showIcon={true} />
                  </div>

                  {/* Reasons */}
                  <div 
                    className="col-span-2 text-secondary-text font-sans text-sm cursor-pointer hover:text-accent transition-colors flex items-center h-full min-w-0"
                    onClick={() => openEvidence(item)}
                    title="Click to view evidence details"
                  >
                    <ul className="list-disc list-inside space-y-1 w-full min-w-0">
                      {item.reasons.map((r, i) => (
                        <li key={i} className="truncate group-hover:underline decoration-structural underline-offset-4">{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 text-right flex justify-end items-center h-full">
                    <button 
                      onClick={() => openEvidence(item)}
                      className="px-4 py-2 bg-canvas hover:bg-structural text-secondary-text hover:text-primary-text border border-structural transition-all text-[10px] font-semibold uppercase tracking-widest shadow-sm hover:shadow active:scale-95 flex items-center"
                    >
                      <FileText size={12} className="mr-2" />
                      Gen Evidence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Evidence Modal */}
      <AnimatePresence>
        {evidenceModalOpen && selectedRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
              onClick={() => setEvidenceModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-surface border border-structural shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-structural flex justify-between items-start bg-canvas">
                <div>
                  <div className="text-[10px] font-sans font-semibold uppercase tracking-widest text-accent mb-2 flex items-center">
                    <ShieldAlert size={12} className="mr-2" />
                    Automated Evidence Package
                  </div>
                  <h3 className="text-xl font-display font-semibold text-primary-text">{selectedRule.id}: {selectedRule.desc}</h3>
                </div>
                <button 
                  onClick={() => setEvidenceModalOpen(false)}
                  className="p-2 text-secondary-text hover:text-primary-text hover:bg-structural transition-colors rounded-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto font-sans flex-1">
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="p-3 bg-canvas border border-structural">
                    <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">Status</div>
                    <StatusBadge status={selectedRule.status as BadgeStatus} showIcon={true} />
                  </div>
                  <div className="p-3 bg-canvas border border-structural">
                    <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">Generated</div>
                    <div className="font-mono text-xs text-primary-text">{selectedRule.date}</div>
                  </div>
                  <div className="p-3 bg-canvas border border-structural">
                    <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">Owner</div>
                    <div className="font-mono text-xs text-primary-text">{selectedRule.owner}</div>
                  </div>
                  <div className="p-3 bg-canvas border border-structural">
                    <div className="text-[9px] uppercase tracking-widest text-secondary-text mb-1">Source</div>
                    <div className="font-mono text-xs text-accent">Live Graph</div>
                  </div>
                </div>

                {/* Evidence Section */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-3 border-b border-structural pb-2 flex items-center">
                    <AlertTriangle size={12} className="mr-2" />
                    Detected Reasons
                  </h4>
                  <div className="space-y-2">
                    {selectedRule.reasons.map((r, i) => (
                      <div key={i} className={`p-4 border font-mono text-sm ${selectedRule.status === 'FAIL' ? 'bg-error/10 border-error/20 text-error' : selectedRule.status === 'WARNING' ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-success/10 border-success/20 text-success'}`}>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affected Entities */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary-text mb-3 border-b border-structural pb-2">Affected Entities</h4>
                  {selectedRule.entities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRule.entities.map(entity => (
                        <span key={entity} className="px-3 py-1 bg-structural text-primary-text font-mono text-xs border border-structural/50 shadow-sm">
                          {entity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-secondary-text italic">No specific entities flagged.</div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-structural bg-canvas flex justify-between items-center text-xs text-secondary-text font-mono">
                <span>ID: PKG-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                <span className="flex items-center text-accent"><Activity size={10} className="mr-2" /> Verified by Keystone Graph Engine</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
