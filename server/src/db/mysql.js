import mysql from "mysql2/promise";

export const createMySqlConnection = (config) => {
  const pool = mysql.createPool(config);
  return {
    name: "MySQL",
    async testConnection() {
      const connection = await pool.getConnection();
      try {
        await connection.query("SELECT 1");
        return { ok: true, message: "MySQL connection successful." };
      } finally {
        connection.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
};
