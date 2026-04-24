import { useState, useEffect, useMemo } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import Badge from "../components/Badge";
import QualityScoreDonut from "../components/QualityScoreDonut";
import QualityRadarChart from "../components/QualityRadarChart";
import QualityLineChart from "../components/QualityLineChart";
import TableCheckBreakdownChart from "../components/TableCheckBreakdownChart";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { 
  Zap, TrendingUp, AlertCircle, Search, Filter, 
  RefreshCw, Download, ChevronDown, ChevronUp, 
  Calendar, Table as TableIcon, Columns, AlertTriangle,
  History, Clock, FileText, BarChart
} from "lucide-react";
import { getQualityData } from "../api";

function DataQualityPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRec, setExpandedRec] = useState(null);
  const [showCompareTrend, setShowCompareTrend] = useState(false);

  const fetchData = async () => {
    try {
      const result = await getQualityData();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); // Refresh every 30s
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredChecks = useMemo(() => {
    if (!data) return [];
    return data.checks.filter(check => {
      const matchesSearch = check.target.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           check.ruleName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = selectedSeverity === "all" || check.severity === selectedSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [data, searchTerm, selectedSeverity]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!data) return null;

  const formattedRows = filteredChecks
    .filter(row => row.severity !== 'info')
    .map(row => ({
      ...row,
      severity: (
        <Badge variant={row.severity}>
          {row.severity.charAt(0).toUpperCase() + row.severity.slice(1)}
        </Badge>
      ),
      category: <Badge variant="outline" className="text-[10px] opacity-70">{row.category}</Badge>,
      rule: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{row.ruleName}</span>,
      target: <code className="text-xs text-orange-500 font-mono">{row.target}</code>,
      message: <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{row.message}</span>
    }));

  const columnScoreRows = Object.entries(data.columnScores || {}).map(([col, score]) => ({
    column: <code className="text-xs text-orange-500 font-mono">{col}</code>,
    score: (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-toggle rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${score > 80 ? 'bg-success' : score > 50 ? 'bg-warning' : 'bg-error'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: score > 80 ? 'var(--success)' : score > 50 ? 'var(--warning)' : 'var(--error)' }}>
          {score}%
        </span>
      </div>
    )
  }));

  const chartData = (data.trends || []).map(t => ({ date: t.date, quality: t.score, rows: t.rows, failed: t.failed, anomaly: t.anomaly }));
  const previous7DayTrend = (data.previous7DayTrend || []).map(t => ({ date: t.date, score: t.score }));

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Rule,Target,Severity,Message\n" + 
      filteredChecks.map(c => `${c.ruleName},${c.target},${c.severity},${c.message}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dataguard_report_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-error/20 text-error">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-error uppercase tracking-wider">Health Alert</h4>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              {data.criticalIssues} critical issues detected across {data.uniqueTables} tables. Immediate action required.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-muted">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${autoRefresh ? 'bg-success/10 border-success/20 text-success' : 'bg-toggle border-default text-muted'}`}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin-slow' : ''} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tables or rules..." 
              className="pl-10 pr-4 py-2.5 rounded-xl border border-default bg-subtle text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-subtle border-default text-secondary hover:border-primary/50'}`}
          >
            <Filter size={16} />
            Filters
            {selectedSeverity !== "all" && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-default bg-subtle text-sm font-bold text-secondary hover:border-primary/50 transition-all"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-5 rounded-2xl border border-default bg-subtle grid gap-6 md:grid-cols-4 animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
              <AlertCircle size={12} /> Severity Level
            </label>
            <select 
              className="w-full p-2.5 rounded-xl border border-default bg-page text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="error">Errors Only</option>
              <option value="warning">Warnings Only</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
              <Calendar size={12} /> Date Range
            </label>
            <div className="p-2.5 rounded-xl border border-default bg-page text-sm text-muted cursor-not-allowed">
              Last 7 Days (Fixed)
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
              <TableIcon size={12} /> Target Table
            </label>
            <div className="p-2.5 rounded-xl border border-default bg-page text-sm text-muted cursor-not-allowed">
              All Tables
            </div>
          </div>
          <div className="flex items-end pb-1">
            <button 
              onClick={() => { setSelectedSeverity("all"); setSearchTerm(""); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 animate-slide-up">
        {[
          { label: "Overall Score", value: `${data.overallScore}%`, change: data.scoreChange, icon: BarChart, color: "primary" },
          { label: "Critical Issues", value: data.criticalIssues, change: -2, icon: AlertTriangle, color: "error", clickable: true },
          { label: "Major Failures", value: data.majorIssues, change: 1, icon: AlertCircle, color: "orange" },
          { label: "Total Tables", value: data.uniqueTables, change: 0, icon: TableIcon, color: "blue" },
        ].map((kpi, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-2xl border bg-subtle transition-all duration-500 hover:scale-105 hover:shadow-xl hover:border-primary/50 group animate-scale-in delay-${(i+1)*100} ${kpi.clickable ? 'cursor-pointer active:scale-95' : ''}`}
            style={{ borderColor: "var(--border-default)" }}
            onClick={() => kpi.clickable && setSelectedSeverity("critical")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${kpi.color}/10 text-${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon size={20} />
              </div>
              {kpi.change !== 0 && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${kpi.change > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                  {kpi.change > 0 ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 group-hover:text-primary transition-colors duration-300">{kpi.label}</h3>
            <p className="text-2xl font-black text-primary group-hover:scale-105 transition-transform origin-left">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up delay-200">
        <Card title="Quality Health Gauge" subtitle="Real-time validation score." className="hover-glow">
          <QualityScoreDonut score={data.overallScore} />
        </Card>
        <Card 
          title="7-Day Quality Trend" 
          subtitle="Score performance over time."
          className="hover-glow"
          headerAction={
            <button 
              onClick={() => setShowCompareTrend(!showCompareTrend)}
              className={`text-[10px] font-black px-2 py-1 rounded border transition-all duration-300 hover:scale-105 ${showCompareTrend ? 'bg-primary text-white border-primary' : 'bg-toggle text-muted border-default'}`}
            >
              {showCompareTrend ? 'Hide Comparison' : 'Compare Previous'}
            </button>
          }
        >
          <QualityLineChart data={chartData} compareData={showCompareTrend ? previous7DayTrend : []} />
        </Card>
        <Card title="Impact Dimensions" subtitle="Performance across pillars." className="hover-glow">
          <QualityRadarChart data={data.dimensions} />
        </Card>
      </div>

      {/* Advanced Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up delay-300">
        <Card title="Top Failing Columns" subtitle="Lowest quality scores identified." className="hover-glow">
          <div className="space-y-4 py-2">
            {data.topFailingColumns && data.topFailingColumns.length > 0 ? (
              data.topFailingColumns.map((col, i) => (
                <div key={i} className="space-y-1.5 group/bar">
                  <div className="flex justify-between text-xs font-bold">
                    <code className="text-orange-500 group-hover/bar:scale-105 transition-transform origin-left">{col.column}</code>
                    <span className={col.score > 50 ? 'text-warning' : 'text-error'}>{col.score}%</span>
                  </div>
                  <div className="h-2 bg-toggle rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${col.score > 50 ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${col.score}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-muted font-bold uppercase tracking-widest bg-subtle/50 rounded-xl border border-dashed border-default">
                All columns passing
              </div>
            )}
          </div>
        </Card>
        <Card title="Data Drift Insights" subtitle="Statistical distribution shifts." className="hover-glow">
          <div className="space-y-4 py-2">
            {[
              { col: "customers.revenue", drift: 0.15, status: "High" },
              { col: "customers.email", drift: 0.08, status: "Low" },
              { col: "orders.amount", drift: 0.04, status: "Negligible" },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-page border border-default hover:border-primary/50 transition-all duration-300 hover:translate-x-1 group/drift">
                <div className="space-y-1">
                  <code className="text-xs text-primary font-bold group-hover/drift:text-primary transition-colors">{d.col}</code>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tighter">Drift Score: {d.drift}</p>
                </div>
                <Badge variant={d.status === 'High' ? 'error' : d.status === 'Low' ? 'warning' : 'success'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card title="AI Root Cause Analysis" subtitle="Automated remediation." className="hover-glow">
          <div className="space-y-3">
            {data.recommendations && data.recommendations.length > 0 ? (
              data.recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="border border-default rounded-xl overflow-hidden transition-all duration-500 hover:border-primary/50"
                  style={{ backgroundColor: expandedRec === i ? "var(--bg-page)" : "transparent" }}
                >
                  <button 
                    onClick={() => setExpandedRec(expandedRec === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-primary/10 text-primary transition-transform duration-500 ${expandedRec === i ? 'rotate-12 scale-110' : ''}`}>
                        <Zap size={16} />
                      </div>
                      <span className="text-sm font-black text-primary">{rec.rule}</span>
                    </div>
                    {expandedRec === i ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </button>
                  {expandedRec === i && (
                    <div className="p-4 pt-0 space-y-4 animate-fade-in">
                      <div className="space-y-1">
                        <h6 className="text-[10px] font-black uppercase tracking-widest text-error">Root Cause</h6>
                        <p className="text-xs text-secondary leading-relaxed">{rec.rootCause}</p>
                      </div>
                      <div className="space-y-1">
                        <h6 className="text-[10px] font-black uppercase tracking-widest text-success">Suggested Fix</h6>
                        <p className="text-xs text-secondary leading-relaxed">{rec.fix}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-muted font-bold uppercase tracking-widest bg-subtle/50 rounded-xl border border-dashed border-default">
                No recommendations found
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Structural & Operational Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card title="Active Failures Log" subtitle="Real-time violation feed.">
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <Table
              columns={[
                { key: "category", label: "Category" },
                { key: "rule", label: "Rule Name" },
                { key: "target", label: "Target" },
                { key: "severity", label: "Severity" },
                { key: "message", label: "Findings" },
              ]}
              rows={formattedRows}
            />
          </div>
        </Card>
        <Card title="Recent Failure Timeline" subtitle="Chronological issue sequence.">
          <div className="space-y-6 py-2 relative before:absolute before:left-2 before:top-4 before:bottom-4 before:w-0.5 before:bg-toggle">
            {(data.failuresTimeline || []).map((item, i) => (
              <div key={i} className="relative pl-8 group">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-subtle bg-${item.severity === 'critical' ? 'error' : item.severity === 'error' ? 'orange' : 'warning'} z-10`} />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted">{item.timestamp}</span>
                    <Badge variant={item.severity}>{item.severity}</Badge>
                  </div>
                  <p className="text-xs font-black text-primary">{item.rule}</p>
                  <p className="text-[10px] font-bold text-secondary">Target: <code className="text-orange-500">{item.table}.{item.col}</code></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Schema & Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up delay-400">
        <Card title="Check Failure Breakdown" subtitle="Violations grouped by table and category." className="hover-glow">
          <TableCheckBreakdownChart data={data.tableCheckBreakdown} />
        </Card>
        <Card title="Schema Drift Log" subtitle="History of structure modifications." className="hover-glow">
          <Table 
            columns={[
              { key: "timestamp", label: "Occurred" },
              { key: "table", label: "Table" },
              { key: "action", label: "Action" },
              { key: "column", label: "Column" },
            { key: "type", label: "Data Type" },
          ]}
          rows={(data.schemaLogs || []).map(log => ({
            ...log,
            action: <Badge variant={log.action === 'Added' ? 'success' : log.action === 'Removed' ? 'error' : 'warning'}>{log.action}</Badge>,
              column: <code className="text-xs text-orange-500 font-mono">{log.column}</code>,
              timestamp: <span className="text-xs text-muted font-medium">{log.timestamp}</span>
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

export default DataQualityPage;
