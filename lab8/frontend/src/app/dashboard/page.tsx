import CheckoutButton from "@/components/CheckoutButton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between items-start gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Backend Overview</h2>
          <p className="text-muted-foreground">Welcome to the ClipSphere control panel. Monitor your IoT sensors and system health.</p>
        </div>
        <CheckoutButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Sensors", value: "12", trend: "+2 this hour" },
          { label: "Alerts", value: "0", trend: "All systems go" },
          { label: "Uptime", value: "99.9%", trend: "Stable" },
          { label: "Storage", value: "1.2 TB", trend: "45% used" }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-primary mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="p-10 rounded-2xl border bg-white dark:bg-zinc-900 shadow-xl flex flex-col items-center justify-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold">Live System Status</h3>
        <p className="max-w-md text-muted-foreground">This page is protected by the dashboard layout. Notice the persistent sidebar and header.</p>
      </div>
    </div>
  );
}
