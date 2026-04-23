import Link from "next/link";
import { LayoutDashboard, Settings, User, Bell, Search } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard Menu</span>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-all"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </nav>
          <div className="mt-auto">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-xs font-semibold text-primary">Pro Feature</p>
              <p className="text-xs text-muted-foreground mt-1">Upgrade to unlock more widgets.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-8 justify-between bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span className="font-medium text-foreground">Dashboard</span>
             <span>/</span>
             <span className="capitalize">Current view</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="search" 
                  placeholder="Search sensors..." 
                  className="pl-8 h-9 w-64 rounded-md border bg-muted/50 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
             </div>
             <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </header>
        <div className="p-8 flex-1 bg-zinc-50/50 dark:bg-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}
