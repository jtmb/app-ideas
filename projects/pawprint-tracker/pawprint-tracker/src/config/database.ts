import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL || "sqlite://memory", {
  dialect: process.env.DB_DIALECT || "postgres",
  logging: false,
});

export const config = {
  connect: async () => {
    await sequelize.authenticate();
    return sequelize;
  },
};

export default sequelize;
