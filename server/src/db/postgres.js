import { Pool } from "pg";

export const createPostgresConnection = (config) => {
  const pool = new Pool(config);
  return {
    name: "PostgreSQL",
    async testConnection() {
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
        return { ok: true, message: "PostgreSQL connection successful." };
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
};
