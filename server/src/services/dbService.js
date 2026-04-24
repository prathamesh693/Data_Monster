import { Client as PostgresClient } from "pg";
import mysql from "mysql2/promise";
import mongoose from "mongoose";
import sqlite3 from "sqlite3";
import mssql from "mssql";
import snowflake from "snowflake-sdk";
import Redis from "ioredis";

const MOCK_TABLES = ["users", "policies", "audit_logs"];
const MOCK_COLUMNS = ["id", "name", "created_at"];
const MAX_QUERY_ROWS = 100;
const READ_ONLY_SQL_START = /^(select|with|show|describe|desc|explain)\b/i;
const BLOCKED_SQL_KEYWORDS = /\b(insert|update|delete|truncate|drop|alter|create|replace|merge|grant|revoke|call|execute|exec|set|rename)\b/i;

const normalizeSql = (query) => query.trim().replace(/;+\s*$/, "");

const applySelectLimit = (query, dbType) => {
  const normalized = normalizeSql(query);
  const isSelect = /^select\s+/i.test(normalized);
  const hasLimit = /\blimit\s+\d+\s*$/i.test(normalized) || /\btop\s+\d+\s+/i.test(normalized);

  if (!isSelect || hasLimit) {
    return normalized;
  }

  if (dbType === "sqlserver") {
    return normalized.replace(/^select\s+/i, `SELECT TOP ${MAX_QUERY_ROWS} `);
  }

  return `${normalized} LIMIT ${MAX_QUERY_ROWS}`;
};

/** Encrypted connection without verifying chain — avoids "self-signed certificate in certificate chain" on many managed DBs. */
const POSTGRES_SSL_RELAXED = { rejectUnauthorized: false };

/** TLS for PostgreSQL — managed DBs reject non-SSL clients ("no encryption"). */
const resolvePostgresSsl = (config) => {
  if (config.ssl === false) {
    return undefined;
  }
  if (config.ssl === true) {
    return POSTGRES_SSL_RELAXED;
  }

  const mode = String(config.sslmode || "").toLowerCase();
  if (mode === "disable") {
    return undefined;
  }
  if (mode === "verify-ca" || mode === "verify-full") {
    return { rejectUnauthorized: true };
  }
  if (mode === "require" || mode === "prefer" || mode === "no-verify") {
    return POSTGRES_SSL_RELAXED;
  }
  if (mode === "allow") {
    return undefined;
  }

  const h = (config.host || "").toLowerCase();
  const isLocal =
    !h || h === "localhost" || h === "127.0.0.1" || h === "::1";
  if (isLocal) {
    return undefined;
  }
  return POSTGRES_SSL_RELAXED;
};

const validateReadOnlySql = (rawQuery) => {
  const query = normalizeSql(rawQuery || "");
  if (!query) {
    return "Query is required.";
  }

  const statements = query
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length > 1) {
    return "Only a single read-only statement is allowed.";
  }

  if (!READ_ONLY_SQL_START.test(query)) {
    return "Only read-only SQL is allowed (SELECT, WITH, SHOW, DESCRIBE, EXPLAIN).";
  }

  if (BLOCKED_SQL_KEYWORDS.test(query)) {
    return "Write and schema-changing commands are blocked for safety.";
  }

  return null;
};

class DbService {
  constructor() {
    this.activeConnection = null;
  }

  async connect(payload = {}) {
    const dbType = (payload.dbType || "").toLowerCase();
    const config = payload.config || {};

    try {
      switch (dbType) {
        case "postgres":
        case "mysql":
        case "sqlserver":
        case "oracle":
        case "sqlite":
        case "snowflake":
        case "redis":
          if (dbType === "postgres") {
            const ssl = resolvePostgresSsl(config);
            const client = new PostgresClient({
              host: config.host,
              port: Number(config.port || 5432),
              user: config.user,
              password: config.password,
              database: config.database,
              connectionTimeoutMillis: 5000,
              ...(ssl !== undefined ? { ssl } : {}),
            });
            await client.connect();
            this.activeConnection = { dbType, client };
          } else if (dbType === "mysql") {
            const pool = mysql.createPool({
              host: config.host,
              port: Number(config.port || 3306),
              user: config.user,
              password: config.password,
              database: config.database,
              waitForConnections: true,
              connectionLimit: 5,
            });
            await pool.query("SELECT 1");
            this.activeConnection = {
              dbType,
              client: pool,
              database: config.database,
            };
          } else if (dbType === "sqlite") {
            const dbPath = config.storage || config.database;
            if (!dbPath) throw new Error("SQLite storage path is required.");
            const db = new sqlite3.Database(dbPath);
            await new Promise((resolve, reject) => {
              db.on("open", () => {
                console.log(`[dbService] SQLite connected to ${dbPath}`);
                resolve();
              });
              db.on("error", (err) => {
                console.error(`[dbService] SQLite error connecting to ${dbPath}:`, err.message);
                reject(err);
              });
            });
            this.activeConnection = { dbType, client: db };
          } else if (dbType === "sqlserver" || dbType === "mssql") {
            const pool = await mssql.connect({
              server: config.host,
              port: Number(config.port || 1433),
              user: config.user,
              password: config.password,
              database: config.database,
              options: {
                encrypt: true,
                trustServerCertificate: true,
              },
              connectionTimeout: 5000,
            });
            this.activeConnection = { dbType: "sqlserver", client: pool };
          } else if (dbType === "snowflake") {
            const connection = snowflake.createConnection({
              account: config.account,
              username: config.user || config.username,
              password: config.password,
              warehouse: config.warehouse,
              database: config.database,
              schema: config.schema || "PUBLIC",
            });
            await new Promise((resolve, reject) => {
              connection.connect((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
              });
            });
            this.activeConnection = { dbType, client: connection };
          } else if (dbType === "redis") {
            const client = new Redis({
              host: config.host,
              port: Number(config.port || 6379),
              password: config.password,
              db: Number(config.database || 0),
              connectTimeout: 5000,
            });
            await client.ping();
            this.activeConnection = { dbType, client };
          } else {
            // Mocking connection for other types (Oracle, etc.)
            console.log(`[dbService] Mocking connection for ${dbType}...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            this.activeConnection = { dbType, mock: true };
          }
          break;

        case "mongodb":
        case "mongo": {
          const uri = config.uri;
          await mongoose.connect(uri);
          this.activeConnection = {
            dbType: "mongodb",
            client: mongoose.connection,
          };
          break;
        }

        default:
          throw new Error(
            "Unsupported dbType. Use postgres, mysql, mongodb, sqlserver, oracle, sqlite, snowflake, or redis."
          );
      }

      return {
        ok: true,
        mock: this.activeConnection.mock || false,
        message: `Connected to ${this.activeConnection.dbType}.`,
      };
    } catch (error) {
      this.activeConnection = {
        dbType: dbType || "unknown",
        mock: true,
      };
      return {
        ok: false,
        mock: true,
        message: `Connection failed. Using mock data. ${error.message}`,
      };
    }
  }

  async getTables() {
    if (!this.activeConnection) {
      return {
        ok: false,
        mock: true,
        tables: MOCK_TABLES,
        message: "No active connection. Returning mock tables.",
      };
    }

    if (this.activeConnection.mock) {
      return {
        ok: false,
        mock: true,
        tables: MOCK_TABLES,
        message: "Connection is in mock mode.",
      };
    }

    try {
      if (this.activeConnection.dbType === "postgres") {
        const result = await this.activeConnection.client.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        );
        return { ok: true, mock: false, tables: result.rows.map((row) => row.table_name) };
      }

      if (this.activeConnection.dbType === "mysql") {
        const [rows] = await this.activeConnection.client.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name;",
          [this.activeConnection.database]
        );
        return { ok: true, mock: false, tables: rows.map((row) => row.TABLE_NAME || row.table_name) };
      }

      if (this.activeConnection.dbType === "mongodb") {
        const collections = await this.activeConnection.client.db
          .listCollections()
          .toArray();
        return {
          ok: true,
          mock: false,
          tables: collections.map((collection) => collection.name),
        };
      }

      if (this.activeConnection.dbType === "sqlite") {
        const result = await new Promise((resolve, reject) => {
          this.activeConnection.client.all(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });
        return { ok: true, mock: false, tables: result.map((row) => row.name) };
      }

      if (this.activeConnection.dbType === "sqlserver") {
        const result = await this.activeConnection.client.request().query(
          "SELECT TABLE_NAME as table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;"
        );
        return { ok: true, mock: false, tables: result.recordset.map((row) => row.table_name) };
      }

      if (this.activeConnection.dbType === "snowflake") {
        const result = await new Promise((resolve, reject) => {
          this.activeConnection.client.execute({
            sqlText: "SHOW TABLES",
            complete: (err, stmt, rows) => {
              if (err) reject(err);
              else resolve(rows);
            },
          });
        });
        return { ok: true, mock: false, tables: result.map((row) => row.name) };
      }

      if (this.activeConnection.dbType === "redis") {
        const keys = await this.activeConnection.client.keys("*");
        return { ok: true, mock: false, tables: keys.slice(0, 10) }; // Mocking "tables" as keys for Redis
      }

      throw new Error("Unsupported active connection.");
    } catch (error) {
      return {
        ok: false,
        mock: true,
        tables: MOCK_TABLES,
        message: `Failed to fetch tables. Returning mock data. ${error.message}`,
      };
    }
  }

  async getColumns(tableName) {
    if (!tableName) {
      return {
        ok: false,
        mock: true,
        columns: MOCK_COLUMNS,
        message: "Missing table parameter. Returning mock columns.",
      };
    }

    if (!this.activeConnection || this.activeConnection.mock) {
      return {
        ok: false,
        mock: true,
        columns: MOCK_COLUMNS,
        message: "No active connection. Returning mock columns.",
      };
    }

    try {
      if (this.activeConnection.dbType === "postgres") {
        const result = await this.activeConnection.client.query(
          "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position;",
          [tableName]
        );
        return { ok: true, mock: false, columns: result.rows.map((row) => row.column_name) };
      }

      if (this.activeConnection.dbType === "mysql") {
        const [rows] = await this.activeConnection.client.query(
          "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position;",
          [this.activeConnection.database, tableName]
        );
        return { ok: true, mock: false, columns: rows.map((row) => row.COLUMN_NAME || row.column_name) };
      }

      if (this.activeConnection.dbType === "mongodb") {
        const sampleDoc = await this.activeConnection.client.db
          .collection(tableName)
          .findOne();
        const columns = sampleDoc ? Object.keys(sampleDoc) : [];
        return { ok: true, mock: false, columns };
      }

      if (this.activeConnection.dbType === "sqlite") {
        const result = await new Promise((resolve, reject) => {
          this.activeConnection.client.all(
            `PRAGMA table_info(${tableName});`,
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });
        return { ok: true, mock: false, columns: result.map((row) => row.name) };
      }

      if (this.activeConnection.dbType === "sqlserver") {
        const request = this.activeConnection.client.request();
        request.input('tableName', mssql.NVarChar, tableName);
        const result = await request.query(
          "SELECT COLUMN_NAME as column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName ORDER BY ORDINAL_POSITION;"
        );
        return { ok: true, mock: false, columns: result.recordset.map((row) => row.column_name) };
      }

      if (this.activeConnection.dbType === "snowflake") {
        const result = await new Promise((resolve, reject) => {
          this.activeConnection.client.execute({
            sqlText: `DESCRIBE TABLE ${tableName}`,
            complete: (err, stmt, rows) => {
              if (err) reject(err);
              else resolve(rows);
            },
          });
        });
        return { ok: true, mock: false, columns: result.map((row) => row.name) };
      }

      if (this.activeConnection.dbType === "redis") {
        return { ok: true, mock: false, columns: ["key", "value", "type", "ttl"] };
      }

      throw new Error("Unsupported active connection.");
    } catch (error) {
      return {
        ok: false,
        mock: true,
        columns: MOCK_COLUMNS,
        message: `Failed to fetch columns. Returning mock data. ${error.message}`,
      };
    }
  }

  async executeQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== "string") {
      return {
        ok: false,
        rows: [],
        rowCount: 0,
        message: "Query is required.",
      };
    }

    const readOnlyError = validateReadOnlySql(rawQuery);
    if (readOnlyError) {
      return {
        ok: false,
        rows: [],
        rowCount: 0,
        message: readOnlyError,
      };
    }

    if (!this.activeConnection || this.activeConnection.mock) {
      return {
        ok: false,
        rows: [],
        rowCount: 0,
        message: "No active database connection available.",
      };
    }

    const query = applySelectLimit(rawQuery, this.activeConnection.dbType);

    try {
      if (this.activeConnection.dbType === "postgres") {
        const result = await this.activeConnection.client.query(query);
        const rows = Array.isArray(result.rows) ? result.rows.slice(0, MAX_QUERY_ROWS) : [];
        return {
          ok: true,
          rows,
          rowCount: rows.length,
          message: "Query executed successfully.",
        };
      }

      if (this.activeConnection.dbType === "mysql") {
        const [resultRows] = await this.activeConnection.client.query(query);
        const rows = Array.isArray(resultRows)
          ? resultRows.slice(0, MAX_QUERY_ROWS)
          : [{ affectedRows: resultRows.affectedRows ?? 0 }];
        return {
          ok: true,
          rows,
          rowCount: rows.length,
          message: "Query executed successfully.",
        };
      }

      if (this.activeConnection.dbType === "mongodb") {
        return {
          ok: false,
          rows: [],
          rowCount: 0,
          message: "SQL query execution is not supported for MongoDB connections.",
        };
      }

      if (this.activeConnection.dbType === "sqlite") {
        const resultRows = await new Promise((resolve, reject) => {
          this.activeConnection.client.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        const rows = Array.isArray(resultRows)
          ? resultRows.slice(0, MAX_QUERY_ROWS)
          : [];
        return {
          ok: true,
          rows,
          rowCount: rows.length,
          message: "Query executed successfully.",
        };
      }

      if (this.activeConnection.dbType === "sqlserver") {
        const result = await this.activeConnection.client.request().query(query);
        const rows = Array.isArray(result.recordset) ? result.recordset.slice(0, MAX_QUERY_ROWS) : [];
        return {
          ok: true,
          rows,
          rowCount: rows.length,
          message: "Query executed successfully.",
        };
      }

      if (this.activeConnection.dbType === "snowflake") {
        const rows = await new Promise((resolve, reject) => {
          this.activeConnection.client.execute({
            sqlText: query,
            complete: (err, stmt, resultRows) => {
              if (err) reject(err);
              else resolve(resultRows);
            },
          });
        });
        const finalRows = Array.isArray(rows) ? rows.slice(0, MAX_QUERY_ROWS) : [];
        return {
          ok: true,
          rows: finalRows,
          rowCount: finalRows.length,
          message: "Query executed successfully.",
        };
      }

      if (this.activeConnection.dbType === "redis") {
        const val = await this.activeConnection.client.get(rawQuery);
        return {
          ok: true,
          rows: [{ key: rawQuery, value: val }],
          rowCount: 1,
          message: "Query executed successfully.",
        };
      }

      return {
        ok: false,
        rows: [],
        rowCount: 0,
        message: "Unsupported active connection type.",
      };
    } catch (_error) {
      return {
        ok: false,
        rows: [],
        rowCount: 0,
        message: "Query execution failed. Please validate SQL syntax and permissions.",
      };
    }
  }
}

export const dbService = new DbService();
