import { EmissionFactors } from '../types';

const EMISSION_FACTORS: EmissionFactors = {
  electricity: {
    us_grid: 0.42, // kg CO2e per kWh
    renewable: 0.05,
    solar: 0.01,
    wind: 0.008,
  },
  natural_gas: {
    standard: 0.2, // kg CO2e per kWh
    efficient: 0.16,
  },
  transportation: {
    car_gasoline: 0.192, // kg CO2e per km
    car_diesel: 0.171,
    bus: 0.089,
    train: 0.041,
    bike: 0,
  },
  heating: {
    electric_heat_pump: 0.05, // kg CO2e per kWh
    gas_furnace: 0.18,
    oil_boiler: 0.26,
  },
};

export class CarbonCalculationService {
  /**
   * Calculate carbon footprint for electricity consumption
   */
  calculateElectricityFootprint(
    consumptionKwh: number,
    sourceType: keyof typeof EMISSION_FACTORS.electricity = 'us_grid'
  ): number {
    const factor = EMISSION_FACTORS.electricity[sourceType];
    return consumptionKwh * factor;
  }

  /**
   * Calculate carbon footprint for natural gas consumption
   */
  calculateGasFootprint(
    consumptionKwh: number,
    efficiency: 'standard' | 'efficient' = 'standard'
  ): number {
    const factor = EMISSION_FACTORS.natural_gas[efficiency];
    return consumptionKwh * factor;
  }

  /**
   * Calculate carbon footprint for transportation distance
   */
  calculateTransportationFootprint(
    distanceKm: number,
    mode: keyof typeof EMISSION_FACTORS.transportation = 'car_gasoline'
  ): number {
    const factor = EMISSION_FACTORS.transportation[mode];
    return distanceKm * factor;
  }

  /**
   * Calculate carbon footprint for heating consumption
   */
  calculateHeatingFootprint(
    consumptionKwh: number,
    type: keyof typeof EMISSION_FACTORS.heating = 'gas_furnace'
  ): number {
    const factor = EMISSION_FACTORS.heating[type];
    return consumptionKwh * factor;
  }

  /**
   * Calculate total carbon footprint from multiple sources
   */
  calculateTotalFootprint(
    electricity: { kwh: number; source?: string },
    gas?: { kwh: number; efficiency?: string },
    transportation?: { distanceKm: number; mode?: string },
    heating?: { kwh: number; type?: string }
  ): { totalKgCo2e: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};

    if (electricity.kwh > 0) {
      const source = electricity.source || 'us_grid';
      breakdown.electricity = this.calculateElectricityFootprint(
        electricity.kwh,
        source as keyof typeof EMISSION_FACTORS.electricity
      );
    }

    if (gas && gas.kwh > 0) {
      const efficiency = gas.efficiency || 'standard';
      breakdown.gas = this.calculateGasFootprint(gas.kwh, efficiency);
    }

    if (transportation && transportation.distanceKm > 0) {
      const mode = transportation.mode || 'car_gasoline';
      breakdown.transportation = this.calculateTransportationFootprint(
        transportation.distanceKm,
        mode as keyof typeof EMISSION_FACTORS.transportation
      );
    }

    if (heating && heating.kwh > 0) {
      const type = heating.type || 'gas_furnace';
      breakdown.heating = this.calculateHeatingFootprint(
        heating.kwh,
        type as keyof typeof EMISSION_FACTORS.heating
      );
    }

    const totalKgCo2e = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
      totalKgCo2e,
      breakdown,
    };
  }

  /**
   * Convert kg CO2e to metric tons
   */
  convertToMetricTons(kgCo2e: number): number {
    return kgCo2e / 1000;
  }

  /**
   * Get emission factor for a specific source
   */
  getEmissionFactor(
    category: 'electricity' | 'gas' | 'transportation' | 'heating',
    subCategory: string
  ): number {
    const factors = EMISSION_FACTORS[category];
    return factors[subCategory as keyof typeof factors] || 0;
  }

  /**
   * Calculate monthly carbon footprint from daily readings
   */
  calculateMonthlyFootprint(
    dailyReadings: Array<{
      date: string;
      electricityKwh?: number;
      gasKwh?: number;
      transportationKm?: number;
      heatingKwh?: number;
    }>
  ): { totalKgCo2e: number; dailyBreakdown: Record<string, number> } {
    const dailyBreakdown: Record<string, number> = {};
    let totalKgCo2e = 0;

    for (const reading of dailyReadings) {
      const date = reading.date;
      const dayTotal = this.calculateDailyFootprint(reading);
      dailyBreakdown[date] = dayTotal;
      totalKgCo2e += dayTotal;
    }

    return {
      totalKgCo2e,
      dailyBreakdown,
    };
  }

  /**
   * Calculate daily carbon footprint from a single reading
   */
  calculateDailyFootprint(reading: {
    electricityKwh?: number;
    gasKwh?: number;
    transportationKm?: number;
    heatingKwh?: number;
  }): number {
    let total = 0;

    if (reading.electricityKwh) {
      total += this.calculateElectricityFootprint(reading.electricityKwh);
    }
    if (reading.gasKwh) {
      total += this.calculateGasFootprint(reading.gasKwh);
    }
    if (reading.transportationKm) {
      total += this.calculateTransportationFootprint(reading.transportationKm);
    }
    if (reading.heatingKwh) {
      total += this.calculateHeatingFootprint(reading.heatingKwh);
    }

    return total;
  }
}

export const carbonCalculationService = new CarbonCalculationService();