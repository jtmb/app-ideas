import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/studysync",
  {
    dialect: "postgres",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;

