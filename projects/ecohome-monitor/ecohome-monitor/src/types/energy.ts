/**
 * EnergyReading data model representing a single energy consumption reading
 * for an IoT device at a specific timestamp.
 */
export interface EnergyReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  electricityKwh: number;
  waterGallons: number;
  gasCcf: number;
  carbonEmissionsKg: number;
}

/**
 * Create a new EnergyReading instance with validation.
 */
export function createEnergyReading(
  deviceId: string,
  timestamp: Date = new Date(),
  electricityKwh: number = 0,
  waterGallons: number = 0,
  gasCcf: number = 0,
  carbonEmissionsKg: number = 0
): EnergyReading {
  // Validate required fields
  if (!deviceId || typeof deviceId !== 'string') {
    throw new Error('deviceId is required and must be a string');
  }

  return {
    id: crypto.randomUUID(),
    deviceId,
    timestamp,
    electricityKwh,
    waterGallons,
    gasCcf,
    carbonEmissionsKg,
  };
}

/**
 * Validate energy reading values are within reasonable ranges.
 */
export function validateEnergyReading(reading: EnergyReading): boolean {
  const validRanges = {
    electricityKwh: { min: -1000, max: 1000 },
    waterGallons: { min: -10000, max: 10000 },
    gasCcf: { min: -1000, max: 1000 },
    carbonEmissionsKg: { min: -100000, max: 100000 },
  };

  for (const [field, range] of Object.entries(validRanges)) {
    const value = reading[field as keyof EnergyReading];
    if (value < range.min || value > range.max) {
      console.warn(`EnergyReading ${reading.id}: ${field} value ${value} outside valid range [${range.min}, ${range.max}]`);
    }
  }

  return true;
}