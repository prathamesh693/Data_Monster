import { useState, useEffect } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import QualityLineChart from "../components/QualityLineChart";
import SeverityDonutChart from "../components/SeverityDonutChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getDashboardMetrics } from "../api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Database, 
  Table as TableIcon, 
  Columns, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Sparkles,
  FileDown
} from "lucide-react";

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMetrics} />;

  const getInsightTag = (insight = "") => {
    const text = insight.toLowerCase();
    if (text.includes("critical") || text.includes("failed")) return "Critical";
    if (text.includes("pii") || text.includes("security")) return "Governance";
    if (text.includes("trend") || text.includes("increased")) return "Trend";
    return "Recommendation";
  };

  const selectedInsight = metrics.aiInsights[activeInsightIndex] || "";
  const hasInsights = metrics.aiInsights.length > 0;

  const getSeverityStatus = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Needs Attention";
    return "Critical";
  };

  const generateRecommendations = () => {
    const recommendations = [];
    if (metrics.criticalIssues > 0) {
      recommendations.push("Prioritize remediation for critical issues within the next monitoring cycle.");
    }
    if (metrics.overallQuality < 80) {
      recommendations.push("Launch focused quality improvement plan for high-risk tables and columns.");
    }
    if (metrics.minorIssues > 0) {
      recommendations.push("Batch minor issue fixes into weekly maintenance workflows.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Maintain current controls and continue proactive monitoring.");
    }
    return recommendations;
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const generatedAt = new Date().toLocaleString();
    const trend = metrics.qualityTrend || [];
    const trendScores = trend.map((entry) => entry.quality);
    const avgQuality = trendScores.length
      ? (trendScores.reduce((sum, val) => sum + val, 0) / trendScores.length).toFixed(1)
      : metrics.overallQuality;
    const recommendations = generateRecommendations();

    // ─── Header Section ───
    doc.setFillColor(15, 23, 42); // Dark Navy from UI
    doc.rect(0, 0, pageWidth, 100, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DataMonster Intelligence Report", 40, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${generatedAt}`, 40, 65);
    doc.text(`System Status: All Monitoring Active`, 40, 80);

    // ─── Stats Grid (Replica of UI Cards) ───
    let currentY = 130;
    const cardWidth = (pageWidth - 100) / 2;
    const cardHeight = 60;
    const gutter = 20;

    stats.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 40 + col * (cardWidth + gutter);
      const y = currentY + row * (cardHeight + gutter);

      // Card Background
      doc.setDrawColor(228, 228, 231); // var(--border-default)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, "FD");

      // Label
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // var(--text-muted)
      doc.text(stat.label, x + 15, y + 20);

      // Value
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      // Use color from UI if possible
      if (stat.label.includes("Critical")) doc.setTextColor(239, 68, 68);
      else if (stat.label.includes("Overall")) doc.setTextColor(79, 70, 229);
      else doc.setTextColor(9, 9, 11);
      
      doc.text(String(stat.value), x + 15, y + 45);
      
      if (index === stats.length - 1) currentY = y + cardHeight + 40;
    });

    // ─── Quality Analysis Section ───
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Data Quality Analysis", 40, currentY);
    
    autoTable(doc, {
      startY: currentY + 15,
      theme: "grid",
      head: [["Metric", "Value", "Benchmark Status"]],
      body: [
        ["Overall Quality Score", `${metrics.overallQuality}%`, getSeverityStatus(metrics.overallQuality)],
        ["7-Day Average", `${avgQuality}%`, "Stable"],
        ["Critical Issues", String(metrics.criticalIssues), metrics.criticalIssues > 0 ? "Action Required" : "Optimal"],
      ],
      styles: { fontSize: 9, cellPadding: 8 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    // ─── AI Insights (Exact Replica of Detail View) ───
    currentY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("AI Intelligence Feed", 40, currentY);

    metrics.aiInsights.slice(0, 4).forEach((insight, i) => {
      const y = currentY + 20 + i * 45;
      doc.setFillColor(248, 250, 252); // var(--bg-subtle)
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(40, y, pageWidth - 80, 35, 6, 6, "FD");
      
      doc.setDrawColor(79, 70, 229); // Accent line
      doc.line(40, y, 40, y + 35);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(insight, pageWidth - 120);
      doc.text(splitText, 55, y + 15);
      
      if (i === 3 || i === metrics.aiInsights.length - 1) currentY = y + 60;
    });

    // ─── Footer ───
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("DataGuard Platform • Automated Quality & Governance Report", 40, footerY);
    doc.text(`Page 1 of 1`, pageWidth - 80, footerY);

    doc.save(`dataguard-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const stats = [
    {
      label: "Connected Sources",
      value: metrics.connectedSources,
      icon: Database,
      iconColor: "var(--text-primary)",
      iconBg: "var(--bg-toggle)",
      valueColor: "var(--text-primary)",
      description: "Total number of databases, data warehouses, or APIs currently integrated with DataGuard.",
    },
    {
      label: "Monitored Tables",
      value: metrics.monitoredTables,
      icon: TableIcon,
      iconColor: "var(--primary)",
      iconBg: "var(--primary-bg)",
      valueColor: "var(--primary)",
      description: "Count of unique database tables that have active monitoring rules or data quality checks applied.",
    },
    {
      label: "Analyzed Columns",
      value: metrics.analyzedColumns,
      icon: Columns,
      iconColor: "var(--text-primary)",
      iconBg: "var(--bg-toggle)",
      valueColor: "var(--text-primary)",
      description: "Number of individual table columns that are being scanned and validated for data quality.",
    },
    {
      label: "Overall Quality",
      value: `${metrics.overallQuality}%`,
      icon: ShieldCheck,
      iconColor: "var(--primary)",
      iconBg: "var(--primary-bg)",
      valueColor: "var(--primary)",
      description: "A weighted average score (0-100%) calculated from the success rate of all data quality checks across monitored tables.",
    },
    {
      label: "Critical Issues",
      value: metrics.criticalIssues,
      icon: AlertCircle,
      iconColor: "var(--error)",
      iconBg: "var(--error-bg)",
      valueColor: "var(--error)",
      variant: "critical",
      description: "Total count of active alerts with 'Critical' severity, indicating severe data quality failures.",
    },
    {
      label: "Minor Issues",
      value: metrics.minorIssues,
      icon: AlertTriangle,
      iconColor: "var(--warning)",
      iconBg: "var(--warning-bg)",
      valueColor: "var(--warning)",
      variant: "warning",
      description: "Count of alerts with 'Warning' or 'Error' severity, representing non-critical quality issues or data drift.",
    },
    {
      label: "AI Insights",
      value: metrics.aiInsights.length,
      icon: Sparkles,
      iconColor: "var(--text-primary)",
      iconBg: "var(--bg-toggle)",
      valueColor: "var(--text-primary)",
      description: "Number of patterns, anomalies, or recommendations generated by the AI analysis engine in the last 24 hours.",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="btn-ghost text-sm"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <FileDown size={15} />
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} title={item.label} description={item.description} tooltipAlign={item.tooltipAlign}>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold tabular-nums mr-[20%]" style={{ color: item.valueColor }}>
                {item.value}
              </p>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: item.iconBg }}
              >
                <item.icon size={20} style={{ color: item.iconColor }} />
              </div>
            </div>
            {item.variant && (
              <div className="mt-3">
                <Badge variant={item.variant} className="text-[10px] uppercase tracking-wide">
                  Action Required
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card 
          title="7-Day Quality Trend" 
          subtitle="Overall data quality score (%)"
          description="Historical trend of the overall quality score sampled daily over the last 7 days to identify patterns or regressions."
        >
          <QualityLineChart data={metrics.qualityTrend} />
        </Card>
        <Card 
          title="Issue Severity Breakdown" 
          subtitle="Current active alerts by level"
          description="Distribution of current active data quality issues categorized by their severity levels (Critical, Error, Warning, Info)."
        >
          <SeverityDonutChart data={metrics.issuesBySeverity} />
        </Card>
      </div>

      {/* Insights Section */}
      <Card 
        title="AI Insights Feed" 
        subtitle="Recently detected patterns and recommendations"
        description="Automated findings and proactive recommendations generated by analyzing metadata, query logs, and quality trends using machine learning."
      >
        <div className="grid gap-4 pt-2 lg:grid-cols-[280px_1fr]">
          {/* Insight List */}
          <div className="space-y-2">
            {metrics.aiInsights.map((insight, i) => {
              const isActive = i === activeInsightIndex;
              const tag = getInsightTag(insight);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActiveInsightIndex(i)}
                  className="w-full rounded-lg border p-3.5 text-left transition-all"
                  style={{
                    borderColor: isActive ? "var(--primary)" : "var(--border-default)",
                    backgroundColor: isActive ? "var(--primary-bg)" : "var(--bg-subtle)",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-default)"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border-default)"; } }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: isActive ? "var(--primary)" : "var(--bg-toggle)",
                        color: isActive ? "white" : "var(--text-primary)",
                      }}
                    >
                      <Sparkles size={13} />
                    </div>
                    <Badge variant={tag}>{tag}</Badge>
                  </div>
                  <p className="line-clamp-2 text-xs font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {insight}
                  </p>
                </button>
              );
            })}
            {!hasInsights && (
              <div
                className="rounded-xl border border-dashed p-4 text-xs text-center"
                style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
              >
                No insights available right now.
              </div>
            )}
          </div>

          {/* Insight Detail Panel */}
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-subtle)" }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-muted)" }}>
                  Insight {hasInsights ? activeInsightIndex + 1 : 0} of {metrics.aiInsights.length}
                </p>
                <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  AI Analysis
                </h4>
              </div>
              <Badge variant="success">Actionable</Badge>
            </div>

            <div
              className="rounded-lg border-l-4 pl-4 py-2"
              style={{ borderLeftColor: "var(--primary)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {hasInsights ? selectedInsight : "New insights will appear here once monitoring detects patterns."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
