import { MongoClient } from "mongodb";

export const createMongoConnection = (config) => {
  const client = new MongoClient(config.uri);
  return {
    name: "MongoDB",
    async testConnection() {
      await client.connect();
      await client.db().command({ ping: 1 });
      return { ok: true, message: "MongoDB connection successful." };
    },
    async close() {
      await client.close();
    },
  };
};
