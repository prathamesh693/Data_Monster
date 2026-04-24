import { config } from "../config/env.js";
import { createPostgresConnection } from "./postgres.js";
import { createMySqlConnection } from "./mysql.js";
import { createMongoConnection } from "./mongo.js";

export const createDbClient = () => {
  switch (config.dbType) {
    case "postgres":
      return createPostgresConnection(config.postgres);
    case "mysql":
      return createMySqlConnection(config.mysql);
    case "mongodb":
    case "mongo":
      return createMongoConnection(config.mongo);
    default:
      throw new Error(
        `Unsupported DB_TYPE "${config.dbType}". Use postgres, mysql, or mongodb.`
      );
  }
};
