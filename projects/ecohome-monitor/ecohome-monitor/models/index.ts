import CarbonFootprint, { ICarbonFootprint } from './CarbonFootprint';

export { CarbonFootprint };
export type { ICarbonFootprint };
import sequelize from '../config/database';
import User, { UserAttributes, UserCreationAttributes } from './user';
import Device, { DeviceAttributes, DeviceCreationAttributes } from './device';

export type { UserAttributes, UserCreationAttributes };
export type { DeviceAttributes, DeviceCreationAttributes };

// Associate models
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync all models
export const syncModels = async () => {
  await sequelize.sync({ force: false });
};

export { User, Device };