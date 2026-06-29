import type { Model } from 'sequelize';
import EnergyReading, { type EnergyReadingAttributes, type EnergyReadingCreationAttributes } from './energy-reading.js';

/**
 * Database schema definitions for the EcoHome Monitor application.
 * 
 * This file exports all model types and provides a centralized schema registry
 * for type-safe database operations.
 */

export interface DeviceAttributes {
  id: number;
  name: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: Date;
}

export interface UserAttributes {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * EnergyReading model - stores individual energy consumption readings
 * from IoT devices. Each reading contains metrics for electricity, water,
 * gas, and calculated carbon emissions.
 */
export const EnergyReadingModel = EnergyReading as unknown as {
  model: typeof EnergyReading;
  attributes: EnergyReadingAttributes;
  create: (data: EnergyReadingCreationAttributes) => Promise<EnergyReading>;
  find: (options?: any) => Promise<EnergyReading | null>;
};

/**
 * Schema registry for all models in the application.
 * Used for type-safe database operations and migrations.
 */
export const schema = {
  energyReadings: {
    model: EnergyReadingModel,
    tableName: 'energy_readings',
    fields: [
      { name: 'id', type: 'bigint', primaryKey: true },
      { name: 'deviceId', type: 'varchar(255)', unique: true, notNull: true },
      { name: 'timestamp', type: 'timestamptz', notNull: true },
      { name: 'electricityKwh', type: 'numeric(10,4)', notNull: true },
      { name: 'waterGallons', type: 'numeric(10,2)', notNull: true },
      { name: 'gasCcf', type: 'numeric(10,4)', notNull: true },
      { name: 'carbonEmissionsKg', type: 'numeric(10,4)', notNull: true },
    ],
    indexes: [
      { name: 'idx_energy_readings_device_id', fields: ['deviceId'], unique: true },
      { name: 'idx_energy_readings_timestamp', fields: ['timestamp'] },
      { name: 'idx_energy_readings_device_timestamp', fields: ['deviceId', 'timestamp'] },
    ],
  },
};

/**
 * Get all model definitions for the application.
 * @returns Map of model names to their Sequelize models
 */
export function getAllModels(): Record<string, typeof Model> {
  return {
    EnergyReading: EnergyReading,
  };
}

/**
 * Validate that a data object conforms to the EnergyReading schema.
 * @param data - Object to validate
 * @returns true if valid, throws error otherwise
 */
export function validateEnergyReading(data: unknown): asserts data is EnergyReadingCreationAttributes {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Energy reading must be an object');
  }

  const requiredFields = ['deviceId', 'timestamp', 'electricityKwh', 'waterGallons', 'gasCcf', 'carbonEmissionsKg'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Type validation
  if (typeof data.deviceId !== 'string' || data.deviceId.trim() === '') {
    throw new Error('deviceId must be a non-empty string');
  }

  if (!(data.timestamp instanceof Date) || isNaN(data.timestamp.getTime())) {
    throw new Error('timestamp must be a valid Date');
  }

  const numericFields = ['electricityKwh', 'waterGallons', 'gasCcf', 'carbonEmissionsKg'];
  for (const field of numericFields) {
    if (typeof data[field] !== 'number' || data[field] < 0) {
      throw new Error(`${field} must be a non-negative number`);
    }
  }
}

export default schema;