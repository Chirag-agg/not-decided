import Sidebar from "@/components/layout/Sidebar";

export default function Settings() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="pb-4 border-b border-zinc-800 mb-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Module // Settings</div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Application Settings</h2>
        </header>

        <div className="bg-zinc-900 border border-zinc-800">
          <div className="p-8">
            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">General Settings</h3>
                <p className="text-zinc-400">
                  Settings functionality will be implemented in a future update.
                  This page serves as a placeholder to fix the broken navigation link.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">API Configuration</h3>
                <p className="text-zinc-400">
                  Configure backend API URLs and other connection settings.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Display Preferences</h3>
                <p className="text-zinc-400">
                  Customize UI themes, density, and visualization options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}