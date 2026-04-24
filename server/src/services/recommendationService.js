import { runQualityChecks } from "./qualityEngine.js";

const recommendationByRule = {
  "PII Detection": (target) => ({
    title: "Encrypt Sensitive Columns",
    description: `The ${target} column contains PII. Encrypt or mask this data and enforce a key management policy.`,
    impact: "High",
    category: "Security",
    action: "Apply Encryption",
    sql: `/* Mask PII data in ${target} */\nUPDATE <table_name>\nSET ${target} = '********'\nWHERE ${target} IS NOT NULL;`
  }),
  "Null Rate Check": (target) => ({
    title: "Reduce Null Values",
    description: `The ${target} column has a high null rate. Consider adding input validation and default handling.`,
    impact: "Medium",
    category: "Quality",
    action: "Enforce Constraint",
    sql: `/* Set default value for nulls in ${target} */\nUPDATE <table_name>\nSET ${target} = 'DEFAULT_VALUE'\nWHERE ${target} IS NULL;`
  }),
  "Primary Key Uniqueness": (target) => ({
    title: "Repair Duplicate Keys",
    description: `Uniqueness violations found in ${target}. Add uniqueness constraints and deduplicate records.`,
    impact: "High",
    category: "Quality",
    action: "Add Constraint",
    sql: `/* Identify and delete duplicates in ${target} */\nDELETE FROM <table_name>\nWHERE id NOT IN (\n  SELECT MIN(id)\n  FROM <table_name>\n  GROUP BY ${target}\n);`
  }),
  "Referential Integrity": (target) => ({
    title: "Fix Referential Integrity",
    description: `Broken foreign keys detected in ${target}. Repair constraints and reconcile orphan references.`,
    impact: "High",
    category: "Quality",
    action: "Repair FK",
    sql: `/* Delete orphans in ${target} */\nDELETE FROM <table_name>\nWHERE ${target} NOT IN (\n  SELECT id FROM <parent_table>\n);`
  }),
  "Volume Anomaly": (target) => ({
    title: "Investigate Row Volume",
    description: `Significant volume anomaly detected in ${target}. Check the ingestion pipeline for data loss.`,
    impact: "Medium",
    category: "Performance",
    action: "Review Pipeline",
    sql: `/* Count rows for ${target} analysis */\nSELECT COUNT(*) FROM <table_name>;`
  }),
  "Timeliness Check": (target) => ({
    title: "Improve Data Freshness",
    description: `Ingestion delay detected for ${target}. Improve pipeline scheduling to reduce latency.`,
    impact: "Low",
    category: "Performance",
    action: "Optimize Schedule",
    sql: `/* Check last update time for ${target} */\nSELECT MAX(updated_at) FROM <table_name>;`
  }),
};

export const getRecommendations = async () => {
  const checks = await runQualityChecks();
  const actionable = checks.filter((check) => check.severity !== "info");

  const recommendations = actionable.map((check) => {
    const builder = recommendationByRule[check.ruleName];
    return builder 
      ? builder(check.target) 
      : {
          title: `Review ${check.ruleName}`,
          description: `Analyze finding on ${check.target} and take corrective action.`,
          impact: "Medium",
          category: "Quality",
          action: "Analyze",
        };
  });

  // Fallback if no issues found
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain Monitoring",
      description: "No immediate quality or security violations found. Continue regular monitoring.",
      impact: "Low",
      category: "Performance",
      action: "Stay Tuned",
    });
  }

  return {
    recommendations: recommendations.slice(0, 6), // Limit to top 6
    recentlyResolved: [
      "Added NOT NULL constraint to 'users.username'",
      "Removed 428 duplicate records from 'audit_logs'",
      "Classified 14 PII columns in 'customers' table"
    ]
  };
};
