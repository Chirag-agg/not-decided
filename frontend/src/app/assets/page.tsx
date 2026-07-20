import Sidebar from "@/components/layout/Sidebar";

export default function AssetHealth() {
  const assets = [
    { id: "PMP-101", type: "Centrifugal Pump", health: 68, risk: 85, lastMaint: "2026-06-12", status: "CRITICAL" },
    { id: "MTR-501", type: "Induction Motor", health: 92, risk: 12, lastMaint: "2026-07-01", status: "HEALTHY" },
    { id: "VLV-201", type: "Control Valve", health: 85, risk: 25, lastMaint: "2026-06-28", status: "MONITOR" },
    { id: "CMP-302", type: "Gas Compressor", health: 96, risk: 4, lastMaint: "2026-07-10", status: "HEALTHY" },
    { id: "HX-401", type: "Heat Exchanger", health: 74, risk: 45, lastMaint: "2026-05-15", status: "WARNING" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
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
            {assets.map((asset) => (
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
                  <span className={`px-2 py-1 uppercase tracking-widest text-[9px] border ${
                    asset.risk > 70 ? 'bg-red-950 text-red-400 border-red-900' : 
                    asset.risk > 30 ? 'bg-amber-950 text-amber-400 border-amber-900' : 
                    'bg-green-950 text-green-400 border-green-900'
                  }`}>
                    {asset.risk}% RISK
                  </span>
                </div>

                <div className="text-zinc-500">{asset.lastMaint}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
