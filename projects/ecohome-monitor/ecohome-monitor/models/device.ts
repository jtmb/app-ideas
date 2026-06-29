import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface DeviceAttributes {
  id: number;
  userId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'error';
  lastSeenAt: Date;
}

export interface DeviceCreationAttributes extends Omit<DeviceAttributes, 'id'> {
  id?: number;
}

const Device = sequelize.define<DeviceAttributes>('Device', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING(36),
    allowNull: false,
    validate: {
      len: [36],
      isUUID: true,
    },
  },
  deviceName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  deviceType: {
    type: DataTypes.ENUM('smart_plug', 'thermostat', 'light', 'sensor', 'camera', 'lock', 'other'),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: false,
    validate: {
      notEmpty: true,
      isIP: true,
    },
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'error'),
    allowNull: false,
    defaultValue: 'offline',
    validate: {
      isIn: [['online', 'offline', 'error']],
    },
  },
  lastSeenAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: new Date(),
  },
});

// Index for efficient queries by user and status
Device.addIndex({ userId, status });

// Index for efficient queries by last seen time
Device.addIndex({ lastSeenAt });

export default Device;