import { dbService } from "./dbService.js";

const severityOrder = {
  critical: 4,
  error: 3,
  warning: 2,
  info: 1,
};

// Rule Weights for scoring (higher = more impact)
const ruleWeights = {
  "PII Detection": 10,
  "Sensitive Data Leakage": 10,
  "Referential Integrity": 8,
  "Primary Key Uniqueness": 7,
  "Composite Key Uniqueness": 6,
  "Null Rate Check": 5,
  "Format Validation (Regex)": 4,
  "Domain Value Check": 4,
  "Data Type Validation": 3,
  "Outlier Detection": 3,
  "Data Drift Detection": 3,
  "Schema Drift Detection": 5,
  "Volume Anomaly": 4,
  "Timeliness Check": 4,
  "Data Freshness / Staleness": 5,
  "Profanity / Toxicity Detection": 6,
  "Language Detection Check": 2,
  "Text Length Validation": 2,
  "JSON Schema Validation": 4,
  "Correlation Consistency": 3,
  "Entropy / Cardinality": 3,
  "Cross-Column Rule Validation": 5,
  "Data Pipeline Latency": 4,
};

const mockDatasetProfile = {
  rowCount: 12450,
  previousDayRowCount: 15780,
  timelinessDelayMinutes: 85,
  pipelineLatencyMs: 4500,
  schema: ["customer_id", "email", "created_at", "status", "phone", "metadata", "last_login"],
  previousSchema: ["customer_id", "email", "created_at", "status", "phone", "metadata"],
  columnOrder: ["customer_id", "email", "created_at", "status", "phone", "metadata", "last_login"],
  previousColumnOrder: ["customer_id", "email", "created_at", "status", "phone", "metadata"],
  tables: {
    customers: {
      customer_id: { nullRate: 0.0, uniqueRate: 1.0, pii: false, dataType: "integer", formatValid: true, entropy: 0.99 },
      email: { nullRate: 0.12, uniqueRate: 0.92, pii: true, dataType: "string", formatValid: 0.95, domainValid: 0.98, textLength: { min: 5, max: 50 }, language: "en", toxicity: 0.01 },
      created_at: { nullRate: 0.01, pii: false, dataType: "timestamp", formatValid: true, freshnessHours: 2.5, seasonalPattern: "normal" },
      status: { nullRate: 0.05, pii: false, dataType: "string", domainValid: 0.85, allowedValues: ["active", "inactive", "pending"] },
      phone: { nullRate: 0.25, pii: true, dataType: "string", formatValid: 0.70, masking: "partial" },
      revenue: { nullRate: 0.0, pii: false, dataType: "decimal", outliers: { zScore: 3.2, iqr: 2.5 }, drift: 0.15, correlation: { with: "status", score: 0.85 } },
      metadata: { nullRate: 0.0, dataType: "json", jsonValid: true, schemaMatch: 0.95 },
      last_login: { nullRate: 0.1, dataType: "timestamp", conditionalNull: { dependsOn: "status", condition: "active", isValid: true } }
    },
    orders: {
      order_id: { nullRate: 0.0, uniqueRate: 0.998, pii: false, dataType: "integer" },
      customer_id: { nullRate: 0.0, pii: false, fkCoverage: 0.97, dataType: "integer" },
      order_ts: { nullRate: 0.02, pii: false, dataType: "timestamp", freshnessHours: 1.2 },
      composite_key: { uniqueRate: 0.995, columns: ["order_id", "customer_id"] },
      crossColumn: { rule: "order_ts < delivery_ts", passed: 0.98 }
    },
  },
  duplicates: { customers: 15, orders: 2 },
  historicalTrends: [
    { date: "2024-03-27", score: 94, rows: 12000, failed: 2 },
    { date: "2024-03-28", score: 92, rows: 12100, failed: 3 },
    { date: "2024-03-29", score: 88, rows: 12200, failed: 8 },
    { date: "2024-03-30", score: 91, rows: 12300, failed: 4 },
    { date: "2024-03-31", score: 85, rows: 12400, failed: 12, anomaly: true },
    { date: "2024-04-01", score: 82, rows: 12450, failed: 15 },
    { date: "2024-04-02", score: 79, rows: 12450, failed: 18 },
  ],
  previous7DayTrend: [
    { date: "2024-03-20", score: 95 },
    { date: "2024-03-21", score: 96 },
    { date: "2024-03-22", score: 94 },
    { date: "2024-03-23", score: 95 },
    { date: "2024-03-24", score: 97 },
    { date: "2024-03-25", score: 95 },
    { date: "2024-03-26", score: 94 },
  ],
  schemaLogs: [
    { timestamp: "2024-04-02 09:00", table: "customers", action: "Added", column: "last_login", type: "timestamp" },
    { timestamp: "2024-04-01 14:30", table: "orders", action: "Modified", column: "order_ts", type: "timestamp (precision update)" },
    { timestamp: "2024-03-30 11:15", table: "customers", action: "Removed", column: "temp_id", type: "integer" }
  ],
  failuresTimeline: [
    { timestamp: "2024-04-02 10:15", table: "customers", col: "email", rule: "Format Validation", severity: "warning" },
    { timestamp: "2024-04-02 09:45", table: "orders", col: "customer_id", rule: "Referential Integrity", severity: "critical" },
    { timestamp: "2024-04-02 08:30", table: "customers", col: "revenue", rule: "Outlier Detection", severity: "error" },
    { timestamp: "2024-04-01 22:00", table: "customers", col: "phone", rule: "PII Detection", severity: "critical" }
  ]
};

const ruleResults = (profile) => {
  const checks = [];
  
  // --- 1. Operational & Structural Checks ---
  
  // Schema Drift
  if (profile.schema && profile.previousSchema) {
    const added = profile.schema.filter(c => !profile.previousSchema.includes(c));
    const removed = profile.previousSchema.filter(c => !profile.schema.includes(c));
    if (added.length > 0) checks.push({ category: "Structural", ruleName: "Schema Drift Detection", target: "Dataset", severity: "info", message: `New columns: ${added.join(", ")}.` });
    if (removed.length > 0) checks.push({ category: "Structural", ruleName: "Schema Drift Detection", target: "Dataset", severity: "warning", message: `Removed columns: ${removed.join(", ")}.` });
  }

  // Column Order
  if (profile.columnOrder && profile.previousColumnOrder && JSON.stringify(profile.columnOrder) !== JSON.stringify(profile.previousColumnOrder)) {
    checks.push({ category: "Structural", ruleName: "Column Order Consistency", target: "Dataset", severity: "info", message: "Column order changed in the source system." });
  }

  // Volume & Latency
  if (profile.rowCount !== undefined && profile.previousDayRowCount !== undefined) {
    checks.push({ category: "Operational", ruleName: "Volume Anomaly", target: "Dataset", severity: profile.rowCount < profile.previousDayRowCount * 0.85 ? "error" : "info", message: `Row count ${profile.rowCount} vs previous ${profile.previousDayRowCount}.` });
  }
  if (profile.pipelineLatencyMs > 5000) {
    checks.push({ category: "Operational", ruleName: "Data Pipeline Latency", target: "Pipeline", severity: "warning", message: `High latency detected: ${profile.pipelineLatencyMs}ms (threshold: 5s).` });
  }

  // Duplicates
  if (profile.duplicates) {
    Object.entries(profile.duplicates).forEach(([tableName, count]) => {
      if (count > 0) checks.push({ category: "Structural", ruleName: "Duplicate Row Detection", target: tableName, severity: count > 10 ? "error" : "warning", message: `Found ${count} duplicate rows.` });
    });
  }

  // --- 2. Table & Column Level Checks ---
  Object.entries(profile.tables || {}).forEach(([tableName, columns]) => {
    Object.entries(columns).forEach(([colName, metrics]) => {
      const target = `${tableName}.${colName}`;
      
      // Nulls & Uniqueness
      if (metrics.nullRate !== undefined) {
        checks.push({ category: "Structural", ruleName: "Null Rate Check", target, severity: metrics.nullRate > 0.1 ? "warning" : "info", message: `Null rate is ${(metrics.nullRate * 100).toFixed(1)}%.` });
      }
      if (metrics.conditionalNull) {
        checks.push({ category: "Structural", ruleName: "Conditional Null Check", target, severity: metrics.conditionalNull.isValid ? "info" : "error", message: `Nulls valid for ${metrics.conditionalNull.condition} ${metrics.conditionalNull.dependsOn}.` });
      }
      if (metrics.uniqueRate !== undefined) {
        const isComp = !!metrics.columns;
        checks.push({ category: "Structural", ruleName: isComp ? "Composite Key Uniqueness" : "Primary Key Uniqueness", target: isComp ? `${tableName}(${metrics.columns.join(",")})` : target, severity: metrics.uniqueRate < 1 ? "error" : "info", message: `${isComp ? 'Comp' : 'PK'} uniqueness is ${(metrics.uniqueRate * 100).toFixed(2)}%.` });
      }

      // Content & Validation
      if (metrics.domainValid !== undefined) {
        checks.push({ category: "Content", ruleName: "Domain Value Check", target, severity: metrics.domainValid < 0.9 ? "error" : "info", message: `Domain validity is ${(metrics.domainValid * 100).toFixed(1)}%.` });
      }
      if (metrics.formatValid !== undefined) {
        const rate = typeof metrics.formatValid === 'number' ? metrics.formatValid : (metrics.formatValid ? 1 : 0);
        checks.push({ category: "Content", ruleName: "Format Validation (Regex)", target, severity: rate < 0.95 ? "warning" : "info", message: `Regex success rate: ${(rate * 100).toFixed(1)}%.` });
      }
      if (metrics.textLength) {
        checks.push({ category: "Content", ruleName: "Text Length Validation", target, severity: "info", message: `Length range: ${metrics.textLength.min}-${metrics.textLength.max} chars.` });
      }
      if (metrics.language) {
        checks.push({ category: "Content", ruleName: "Language Detection Check", target, severity: "info", message: `Language detected as '${metrics.language}'.` });
      }
      if (metrics.toxicity !== undefined) {
        checks.push({ category: "Content", ruleName: "Profanity / Toxicity Detection", target, severity: metrics.toxicity > 0.05 ? "error" : "info", message: `Toxicity score: ${(metrics.toxicity * 100).toFixed(2)}%.` });
      }
      if (metrics.jsonValid !== undefined) {
        checks.push({ category: "Structural", ruleName: "JSON Schema Validation", target, severity: metrics.jsonValid ? "info" : "error", message: `JSON schema match: ${(metrics.schemaMatch * 100).toFixed(1)}%.` });
      }

      // Statistical
      if (metrics.outliers) {
        const hasOut = metrics.outliers.zScore > 3 || metrics.outliers.iqr > 2;
        checks.push({ category: "Statistical", ruleName: "Outlier Detection", target, severity: hasOut ? "warning" : "info", message: `Outliers detected (Z:${metrics.outliers.zScore.toFixed(1)}).` });
      }
      if (metrics.drift !== undefined) {
        checks.push({ category: "Statistical", ruleName: "Data Drift Detection", target, severity: metrics.drift > 0.1 ? "warning" : "info", message: `Drift score: ${(metrics.drift * 100).toFixed(1)}%.` });
      }
      if (metrics.entropy !== undefined) {
        checks.push({ category: "Statistical", ruleName: "Entropy / Cardinality", target, severity: "info", message: `Entropy: ${metrics.entropy.toFixed(2)} (High cardinality).` });
      }
      if (metrics.correlation) {
        checks.push({ category: "Statistical", ruleName: "Correlation Consistency", target, severity: "info", message: `Correlation with ${metrics.correlation.with}: ${metrics.correlation.score.toFixed(2)}.` });
      }
      if (metrics.seasonalPattern) {
        checks.push({ category: "Statistical", ruleName: "Seasonal Pattern Validation", target, severity: "info", message: `Pattern follows expected seasonality: ${metrics.seasonalPattern}.` });
      }

      // Security
      if (metrics.pii) {
        checks.push({ category: "Security", ruleName: "PII Detection", target, severity: "critical", message: "Sensitive field (PII) detected." });
      }
      if (metrics.masking) {
        checks.push({ category: "Security", ruleName: "Masking / Encryption Validation", target, severity: metrics.masking === 'none' ? "error" : "info", message: `Masking status: ${metrics.masking}.` });
      }

      // Freshness
      if (metrics.freshnessHours !== undefined) {
        checks.push({ category: "Operational", ruleName: "Data Freshness / Staleness", target, severity: metrics.freshnessHours > 2 ? "error" : "info", message: `Data age: ${metrics.freshnessHours.toFixed(1)}h (SLA: 2h).` });
      }

      // Cross-Column (Special Case)
      if (metrics.crossColumn) {
        checks.push({ category: "Content", ruleName: "Cross-Column Rule Validation", target: tableName, severity: metrics.crossColumn.passed < 0.95 ? "warning" : "info", message: `Rule '${metrics.crossColumn.rule}' passed: ${(metrics.crossColumn.passed * 100).toFixed(1)}%.` });
      }
    });
  });

  return checks.length > 0 ? checks : [
    { category: "System", ruleName: "System Check", target: "Engine", severity: "info", message: "No violations found." }
  ];
};

const scoreFromChecks = (checks) => {
  if (checks.length === 0) return { overall: 100, columnScores: {} };
  
  const columnScores = {};
  let totalPenalty = 0;
  let totalMaxPenalty = 0;

  checks.forEach(check => {
    const severityVal = severityOrder[check.severity] || 0;
    const weight = ruleWeights[check.ruleName] || 2;
    const penalty = severityVal * weight;
    const maxPossiblePenalty = 4 * weight; // 4 is critical severity

    totalPenalty += penalty;
    totalMaxPenalty += maxPossiblePenalty;

    if (check.target && check.target.includes('.')) {
      if (!columnScores[check.target]) columnScores[check.target] = 100;
      columnScores[check.target] -= (penalty / maxPossiblePenalty) * 20; // Scale to 100
    }
  });

  Object.keys(columnScores).forEach(key => columnScores[key] = Math.max(0, Math.round(columnScores[key])));
  
  const overallScore = Math.max(0, 100 - (totalPenalty / totalMaxPenalty) * 100);
  return { overall: Math.round(overallScore), columnScores };
};

const buildDimensions = (checks) => {
  const has = (ruleName, severityCutoff) =>
    checks.some(c => c.ruleName === ruleName && severityOrder[c.severity] >= severityOrder[severityCutoff]);

  const catScore = (category, base) => {
    const catChecks = checks.filter(c => c.category === category && severityOrder[c.severity] > 1);
    return Math.max(60, base - (catChecks.length * 5));
  };

  return {
    completeness: catScore("Structural", 92),
    timeliness: catScore("Operational", 93),
    uniqueness: has("Primary Key Uniqueness", "error") || has("Composite Key Uniqueness", "error") ? 69 : 95,
    consistency: catScore("Content", 94),
    validity: has("PII Detection", "critical") || has("Format Validation (Regex)", "warning") ? 70 : 90,
  };
};

export const runQualityChecks = async () => {
  const tablesResult = await dbService.getTables();
  
  if (tablesResult.mock || !tablesResult.ok) {
    return ruleResults(mockDatasetProfile);
  }

  // Real DB profiling would go here - for now we use the advanced mock profile
  // but could be extended to run real queries as in previous version
  return ruleResults(mockDatasetProfile);
};

export const getQualitySummary = async () => {
  const checks = await runQualityChecks();
  const scores = scoreFromChecks(checks);
  const dimensions = buildDimensions(checks);
  
  const criticalIssues = checks.filter(c => c.severity === 'critical').length;
  const majorIssues = checks.filter(c => c.severity === 'error').length;
  const minorIssues = checks.filter(c => c.severity === 'warning').length;
  const uniqueTables = new Set(checks.map(c => c.target.split('.')[0])).size;

  const currentScore = scores.overall;
  const previousScore = mockDatasetProfile.historicalTrends[mockDatasetProfile.historicalTrends.length - 2].score;
  const scoreChange = currentScore - previousScore;

  const tableCheckBreakdown = {};
  checks.forEach(c => {
    const table = c.target.split('.')[0];
    if (!tableCheckBreakdown[table]) tableCheckBreakdown[table] = {};
    if (!tableCheckBreakdown[table][c.category]) tableCheckBreakdown[table][c.category] = 0;
    tableCheckBreakdown[table][c.category]++;
  });

  return {
    overallScore: scores.overall,
    previousScore,
    scoreChange,
    columnScores: scores.columnScores,
    passedChecks: checks.filter(c => c.severity === 'info').length,
    failedChecks: checks.filter(c => c.severity !== 'info').length,
    criticalIssues,
    majorIssues,
    minorIssues,
    uniqueTables,
    dimensions,
    checks,
    trends: mockDatasetProfile.historicalTrends,
    previous7DayTrend: mockDatasetProfile.previous7DayTrend,
    schemaLogs: mockDatasetProfile.schemaLogs,
    failuresTimeline: mockDatasetProfile.failuresTimeline,
    tableCheckBreakdown,
    topFailingColumns: Object.entries(scores.columnScores)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([column, score]) => ({ column, score })),
    recommendations: [
      { rule: "PII Detection", advice: "Enable masking for phone/email columns.", rootCause: "PII fields identified without encryption metadata.", fix: "Apply AES-256 encryption at the ingestion layer." },
      { rule: "Null Rate", advice: "Investigate ingestion pipe for 'email' field drops.", rootCause: "Upstream API change removed required email field.", fix: "Update schema mapping to handle optional email fields." },
      { rule: "Outliers", advice: "Verify if 'revenue' spikes are seasonal or fraudulent.", rootCause: "Marketing campaign caused organic spike in revenue.", fix: "No action needed, mark as expected seasonal variation." }
    ]
  };
};
