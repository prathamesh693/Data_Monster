import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  dbType: (process.env.DB_TYPE || "postgres").toLowerCase(),
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "dataguard",
  },
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DB || "dataguard",
  },
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/dataguard",
  },
};
