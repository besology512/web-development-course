import { getSensors } from "./_lib/sensorData";
import Link from "next/link";
import FilterButton from "./FilterButton";
import { Activity, Thermometer, Radio, Wind, ArrowRight } from "lucide-react";

const icons = {
  temperature: Thermometer,
  motion: Activity,
  humidity: Radio,
  'air-quality': Wind,
};

export default async function SensorsPage() {
  const sensors = await getSensors();

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">IoT Sensor Cluster</h1>
          <p className="text-muted-foreground mt-2">Real-time data from your distributed sensor network.</p>
        </div>
        <FilterButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sensors.map((sensor) => {
          const Icon = icons[sensor.type];
          return (
            <div key={sensor.id} className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${sensor.status === 'online' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sensor.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {sensor.status.toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold">{sensor.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">ID: {sensor.id}</p>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Value</p>
                  <p className="text-2xl font-bold">{sensor.value}</p>
                </div>
                <Link 
                  href={`/sensors/${sensor.id}`} 
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  title="View Details"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
