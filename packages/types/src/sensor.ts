export interface Sensor {
  id: string;
  name: string;
  type: string;
  group: string;
  location: string;
  status: "active" | "warning" | "error" | "inactive";
  lastValue: number;
  unit: string;
  lastUpdate: string;
  description?: string;
  connectionType?: "wifi" | "ethernet" | "lora" | "modbus";
  ipAddress?: string;
  port?: number;
  pollingInterval?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
