import { getQualitySummary, runQualityChecks } from "../services/qualityEngine.js";

export const qualityChecksHandler = async (_req, res) => {
  try {
    const checks = await runQualityChecks();
    return res.status(200).json(checks);
  } catch (_error) {
    return res.status(200).json([
      {
        ruleName: "Null Rate Check",
        target: "sample.table_column",
        severity: "info",
        message: "Fallback mock response.",
      },
    ]);
  }
};

export const qualitySummaryHandler = async (_req, res) => {
  try {
    const summary = await getQualitySummary();
    return res.status(200).json(summary);
  } catch (_error) {
    return res.status(200).json({
      overallScore: 0,
      passedChecks: 0,
      failedChecks: 0,
      dimensions: {
        completeness: 0,
        timeliness: 0,
        uniqueness: 0,
        consistency: 0,
        validity: 0,
      },
    });
  }
};
