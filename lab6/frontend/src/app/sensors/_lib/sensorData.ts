export type Sensor = {
  id: string;
  name: string;
  type: 'temperature' | 'motion' | 'humidity' | 'air-quality';
  status: 'online' | 'offline';
  value: string;
  lastUpdated: string;
};

export const MOCK_SENSORS: Sensor[] = [
  { id: 'temp-001', name: 'Server Room Temp', type: 'temperature', status: 'online', value: '22.5°C', lastUpdated: '2 min ago' },
  { id: 'motion-99', name: 'Main Entrance', type: 'motion', status: 'online', value: 'Detected', lastUpdated: 'Just now' },
  { id: 'hum-alpha', name: 'Greenhouse Humidity', type: 'humidity', status: 'online', value: '65%', lastUpdated: '15 min ago' },
  { id: 'air-beta', name: 'Lab Air Quality', type: 'air-quality', status: 'offline', value: '--', lastUpdated: '2 hours ago' },
];

export async function getSensors(): Promise<Sensor[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_SENSORS;
}

export async function getSensorById(id: string): Promise<Sensor | undefined> {
  // Simulate gateway delay for Part 8
  await new Promise(resolve => setTimeout(resolve, 2000));
  return MOCK_SENSORS.find(s => s.id === id);
}
