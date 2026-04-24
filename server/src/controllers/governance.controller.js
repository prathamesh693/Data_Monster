import { getGovernanceMetrics } from "../services/governanceService.js";

export const governanceHandler = async (_req, res) => {
  try {
    const data = await getGovernanceMetrics();
    return res.status(200).json(data);
  } catch (_error) {
    return res.status(200).json({
      maturityScore: 0,
      piiTablesCount: 0,
      classifiedTablesCount: 0,
      catalog: [],
    });
  }
};
