export interface EmissionFactors {
  electricity: {
    us_grid: number;
    renewable: number;
    solar: number;
    wind: number;
  };
  natural_gas: {
    standard: number;
    efficient: number;
  };
  transportation: {
    car_gasoline: number;
    car_diesel: number;
    bus: number;
    train: number;
    bike: number;
  };
  heating: {
    electric_heat_pump: number;
    gas_furnace: number;
    oil_boiler: number;
  };
}

export interface CarbonFootprintResult {
  totalKgCo2e: number;
  breakdown: Record<string, number>;
}

export interface DailyReading {
  date: string;
  electricityKwh?: number;
  gasKwh?: number;
  transportationKm?: number;
  heatingKwh?: number;
}

export interface MonthlyFootprintResult {
  totalKgCo2e: number;
  dailyBreakdown: Record<string, number>;
}