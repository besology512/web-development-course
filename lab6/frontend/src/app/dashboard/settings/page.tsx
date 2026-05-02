import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold border-b pb-4 mb-4">General Configuration</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Dashboard Name</label>
              <input 
                type="text" 
                defaultValue="ClipSphere Ops" 
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" id="notifications" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
               <label htmlFor="notifications" className="text-sm">Enable critical alerts emails</label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete all sensor history or reset account.</p>
          <button className="h-10 rounded-md border border-destructive bg-transparent px-4 text-sm font-medium text-destructive hover:bg-destructive hover:text-white transition-all">
            Reset System Data
          </button>
        </div>
      </div>
    </div>
  );
}
