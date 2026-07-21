import Sidebar from "@/components/layout/Sidebar";
import { StatusBadge, BadgeStatus } from "@/components/ui/StatusBadge";

export default function Compliance() {
  const complianceItems = [
    { id: "OISD-116", desc: "Fire Protection Facilities for Petroleum Refineries", status: "PASS", date: "2026-07-01", owner: "Safety Team" },
    { id: "OISD-142", desc: "Inspection of Fire Fighting Equipment", status: "PASS", date: "2026-06-15", owner: "Safety Team" },
    { id: "FACT-41", desc: "Factory Act: Safety of Plant & Machinery", status: "WARNING", date: "2026-07-10", owner: "Maintenance" },
    { id: "FACT-87", desc: "Dangerous Operations & Protocols", status: "FAIL", date: "2026-07-13", owner: "Operations" },
    { id: "ISO-45001", desc: "Occupational Health & Safety", status: "PASS", date: "2026-01-20", owner: "Compliance Office" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="pb-4 border-b border-zinc-800 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Module // Compliance</div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Regulatory QMS Audits</h2>
        </header>

        <div className="bg-zinc-900 border border-zinc-800">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-950">
            <div>Standard</div>
            <div className="col-span-2">Description</div>
            <div>Status</div>
            <div>Last Audit</div>
            <div>Owner</div>
          </div>
          
          <div className="divide-y divide-zinc-800 font-mono text-xs">
            {complianceItems.map((item) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-zinc-800/50 transition-colors">
                <div className="font-semibold text-zinc-100">{item.id}</div>
                <div className="col-span-2 text-zinc-400">{item.desc}</div>
                
                {/* Status Badge */}
                <StatusBadge status={item.status as BadgeStatus} showIcon={true} />

                <div className="text-zinc-500">{item.date}</div>
                <div className="text-zinc-500">{item.owner}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
