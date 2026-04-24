import { dbService } from "../services/dbService.js";

export const connectToDatabase = async (req, res) => {
  const result = await dbService.connect(req.body);
  const statusCode = result.ok ? 200 : 207;
  return res.status(statusCode).json(result);
};

export const getTables = async (_req, res) => {
  const result = await dbService.getTables();
  const statusCode = result.ok ? 200 : 207;
  return res.status(statusCode).json(result);
};

export const getColumns = async (req, res) => {
  const table = req.query.table || req.query.collection;
  const result = await dbService.getColumns(table);
  const statusCode = result.ok ? 200 : 207;
  return res.status(statusCode).json(result);
};

export const postQuery = async (req, res) => {
  const { query } = req.body || {};
  const result = await dbService.executeQuery(query);
  const statusCode = result.ok ? 200 : 400;
  return res.status(statusCode).json(result);
};
