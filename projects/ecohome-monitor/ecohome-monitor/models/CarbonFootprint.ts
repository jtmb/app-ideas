import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface CarbonFootprintAttributes {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEmissionsKg: number;
  nationalAverageKg: number;
  reductionPercent: number;
}

export interface ICarbonFootprint extends CarbonFootprintAttributes {
  readonly id: string;
  readonly userId: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly totalEmissionsKg: number;
  readonly nationalAverageKg: number;
  readonly reductionPercent: number;
}

const CarbonFootprint: Model<CarbonFootprintAttributes> = sequelize.define(
  'carbonFootprint',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      comment: 'Reference to the user who owns this carbon footprint record',
    },
    periodStart: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'period_start',
      comment: 'Start date of the carbon footprint calculation period',
    },
    periodEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'period_end',
      comment: 'End date of the carbon footprint calculation period',
    },
    totalEmissionsKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_emissions_kg',
      comment: 'Total carbon emissions in kilograms for the period',
      validate: {
        min: 0,
        msg: 'Total emissions cannot be negative',
      },
    },
    nationalAverageKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'national_average_kg',
      comment: 'National average carbon emissions for comparison',
      validate: {
        min: 0,
        msg: 'National average cannot be negative',
      },
    },
    reductionPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'reduction_percent',
      comment: 'Percentage reduction compared to national average',
      validate: {
        min: -100,
        max: 100,
        msg: 'Reduction percent must be between -100 and 100',
      },
    },
  },
  {
    tableName: 'carbon_footprints',
    timestamps: false,
    indexes: [
      {
        name: 'idx_carbon_footprint_user_id',
        fields: ['userId'],
        unique: true,
      },
      {
        name: 'idx_carbon_footprint_period',
        fields: ['periodStart', 'periodEnd'],
      },
    ],
  }
);

export default CarbonFootprint;