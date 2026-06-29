import { DataTypes } from 'sequelize';
import type { Optional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Model } from 'sequelize';

export interface EnergyReadingAttributes {
  id: number;
  deviceId: string;
  timestamp: Date;
  electricityKwh: number;
  waterGallons: number;
  gasCcf: number;
  carbonEmissionsKg: number;
}

export interface EnergyReadingCreationAttributes extends Optional<EnergyReadingAttributes, 'id'> {}

/**
 * EnergyReading model representing a single energy consumption reading
 * from an IoT device. Stores metrics for electricity, water, gas, and
 * calculated carbon emissions.
 */
class EnergyReading extends Model<EnergyReadingAttributes, EnergyReadingCreationAttributes> implements EnergyReadingAttributes {
  public readonly id!: number;
  public readonly deviceId!: string;
  public readonly timestamp!: Date;
  public readonly electricityKwh!: number;
  public readonly waterGallons!: number;
  public readonly gasCcf!: number;
  public readonly carbonEmissionsKg!: number;

  /**
   * Initialize a new EnergyReading instance.
   * @param deviceId - The ID of the IoT device that generated this reading
   * @param timestamp - When the reading was taken
   * @param electricityKwh - Electricity consumption in kilowatt-hours
   * @param waterGallons - Water consumption in gallons
   * @param gasCcf - Natural gas consumption in hundred cubic feet
   * @param carbonEmissionsKg - Calculated carbon emissions in kilograms
   */
  public static init(
    deviceId: string,
    timestamp: Date,
    electricityKwh: number,
    waterGallons: number,
    gasCcf: number,
    carbonEmissionsKg: number
  ): EnergyReading {
    return new EnergyReading({
      deviceId,
      timestamp,
      electricityKwh,
      waterGallons,
      gasCcf,
      carbonEmissionsKg,
    });
  }

  /**
   * Calculate total energy consumption across all metrics.
   * @returns Sum of electricity (kWh), water (gallons), and gas (ccf)
   */
  public getTotalConsumption(): number {
    return this.electricityKwh + this.waterGallons + this.gasCcf;
  }

  /**
   * Check if this reading represents significant energy usage.
   * @param threshold - Minimum total consumption to be considered significant
   * @returns true if total consumption exceeds threshold
   */
  public isSignificant(threshold: number = 10): boolean {
    return this.getTotalConsumption() >= threshold;
  }

  /**
   * Get the primary energy source for this reading.
   * @returns The energy source with highest consumption
   */
  public getPrimaryEnergySource(): 'electricity' | 'water' | 'gas' {
    if (this.electricityKwh >= this.waterGallons && this.electricityKwh >= this.gasCcf) {
      return 'electricity';
    }
    if (this.waterGallons >= this.gasCcf) {
      return 'water';
    }
    return 'gas';
  }
}

EnergyReading.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
      comment: 'Unique identifier for the IoT device',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
      comment: 'When the energy reading was taken',
    },
    electricityKwh: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 9999.9999,
      },
      comment: 'Electricity consumption in kilowatt-hours',
    },
    waterGallons: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 9999.99,
      },
      comment: 'Water consumption in gallons',
    },
    gasCcf: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 999.9999,
      },
      comment: 'Natural gas consumption in hundred cubic feet',
    },
    carbonEmissionsKg: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 9999.9999,
      },
      comment: 'Calculated carbon emissions in kilograms',
    },
  },
  {
    tableName: 'energy_readings',
    timestamps: false, // Energy readings are immutable historical data
    indexes: [
      {
        fields: ['deviceId'],
        unique: true,
        name: 'idx_energy_readings_device_id',
      },
      {
        fields: ['timestamp'],
        name: 'idx_energy_readings_timestamp',
      },
      {
        fields: ['deviceId', 'timestamp'],
        name: 'idx_energy_readings_device_timestamp',
      },
    ],
    comments: {
      model: 'Energy consumption readings from IoT devices',
      deviceId: 'Device identifier',
      timestamp: 'Reading timestamp',
      electricityKwh: 'Electricity in kWh',
      waterGallons: 'Water in gallons',
      gasCcf: 'Gas in hundred cubic feet',
      carbonEmissionsKg: 'Carbon emissions in kg',
    },
  }
);

// Define Sequelize types for the model
EnergyReading.prototype.toJSON = function () {
  return this.get({ plain: true });
};

export default EnergyReading;