// Device types
export interface Device {
  id: string;
  name: string;
  type: 'smart_plug' | 'thermostat' | 'smart_meter' | 'sensor';
  status: 'online' | 'offline' | 'error';
  location: string;
  lastSeen: Date;
  metadata?: Record<string, unknown>;
}

// Energy data types
export interface EnergyReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  consumptionKwh: number;
  voltage: number;
  currentAmps: number;
  powerWatts: number;
}

// Analytics types
export interface Prediction {
  id: string;
  deviceId: string;
  forecastDate: Date;
  predictedConsumptionKwh: number;
  confidence: number;
}

export interface Trend {
  period: 'daily' | 'weekly' | 'monthly';
  start: Date;
  end: Date;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
  }>;
}

// Request/Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}