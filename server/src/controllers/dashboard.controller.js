import { getDashboardMetrics } from "../services/dashboardService.js";

export const getDashboard = async (_req, res) => {
  try {
    const data = await getDashboardMetrics();
    return res.status(200).json(data);
  } catch (_error) {
    // Fallback mock in case service errors unexpectedly.
    return res.status(200).json({
      connectedSources: 0,
      monitoredTables: 0,
      analyzedColumns: 0,
      overallQuality: 0,
      criticalIssues: 0,
      minorIssues: 0,
      aiInsights: ["Dashboard is running in fallback mode."],
      qualityTrend: [],
      issuesBySeverity: {
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
      },
    });
  }
};
