import { getSensorById } from "../_lib/sensorData";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft, RefreshCcw, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sensor = await getSensorById(id);
  
  return {
    title: sensor ? `${sensor.name} | ClipSphere` : "Sensor Not Found",
    description: sensor ? `Real-time monitoring for ${sensor.name}` : "Details about the selected sensor.",
  };
}

export default async function SensorPage({ params }: PageProps) {
  const { id } = await params;
  const sensor = await getSensorById(id);

  if (!sensor) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <Link href="/sensors" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Sensors
      </Link>

      <div className="rounded-3xl border bg-card shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-8 border-b flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{sensor.name}</h1>
            <p className="text-muted-foreground">Detailed telemetry for sensor unit <code className="bg-muted px-1 rounded font-mono">{id}</code></p>
          </div>
          <div className="h-12 w-12 rounded-full border bg-background flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Current Reading</p>
              <p className="text-5xl font-extrabold text-primary">{sensor.value}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    <span>Last Sync: {sensor.lastUpdated}</span>
                </div>
                <div className={`h-2 w-2 rounded-full ${sensor.status === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="capitalize font-medium">{sensor.status}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/50 p-6 space-y-4">
             <div className="flex items-center gap-2 font-semibold">
                <Info className="h-5 w-5 text-primary" />
                <span>Technical Specifications</span>
             </div>
             <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-muted-foreground/10 pb-2">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{sensor.type}</span>
                </li>
                <li className="flex justify-between border-b border-muted-foreground/10 pb-2">
                    <span className="text-muted-foreground">Firmware</span>
                    <span className="font-medium">v2.4.1-stable</span>
                </li>
                <li className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">Zone 4-B Gateway</span>
                </li>
             </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <button className="h-12 rounded-xl border bg-background font-medium hover:bg-accent transition-all">Download Log Data</button>
         <button className="h-12 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-all">Configure Thresholds</button>
      </div>
    </div>
  );
}
