import { useState, useEffect } from "react";
import Card from "../components/Card";
import Table from "../components/Table";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getGovernanceData } from "../api";
import { Shield, Lock, FileText, CheckCircle2, Database, EyeOff } from "lucide-react";

const sensitivityMap = {
  Restricted: "critical",
  Confidential: "error",
  Internal: "info",
  Public: "success",
};

function GovernancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getGovernanceData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!data) return null; // Add this guard clause

  const formattedRows = data.catalog.map(row => ({
    ...row,
    entity: (
      <div className="flex items-center gap-2">
        <Database size={14} className="text-slate-500" />
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{row.entity}</span>
      </div>
    ),
    sensitivity: (
      <Badge variant={sensitivityMap[row.sensitivity]}>
        {row.sensitivity}
      </Badge>
    ),
    pii: row.piiDetected ? (
      <div className="flex items-center gap-1.5 text-red-400">
        <EyeOff size={14} />
        <span className="text-xs font-bold">Yes</span>
        <span className="text-[10px] opacity-70">({row.piiFields.join(', ')})</span>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-slate-400">
        <CheckCircle2 size={14} />
        <span className="text-xs font-medium">No</span>
      </div>
    )
  }));

  const governanceStats = [
    { 
      label: "Maturity Score", 
      value: `${data.maturityScore}/100`, 
      icon: Shield, 
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      description: "A composite index reflecting the overall strength of data governance controls, including classification coverage and PII protection."
    },
    { 
      label: "Tables with PII", 
      value: data.piiTablesCount, 
      icon: Lock, 
      color: "text-red-400",
      bg: "bg-red-500/10",
      description: "The total number of unique tables that have been identified as containing Personally Identifiable Information (PII)."
    },
    { 
      label: "Classified Tables", 
      value: data.classifiedTablesCount, 
      icon: FileText, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10",
      description: "The number of tables that have been scanned and assigned a sensitivity classification level (e.g., Restricted, Confidential).",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {governanceStats.map((item) => (
          <Card key={item.label} title={item.label} description={item.description} tooltipAlign={item.tooltipAlign}>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <div className={`rounded-lg p-2 ${item.bg}`}>
                <item.icon size={20} className={item.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Data Catalog Table */}
      <Card 
        title="Data Catalog Governance" 
        subtitle="Classifications and sensitivity posture by entity."
        description="A comprehensive inventory of data assets, displaying their assigned sensitivity levels and whether PII has been detected."
      >
        <Table
          columns={[
            { key: "entity", label: "Entity" },
            { key: "sensitivity", label: "Sensitivity" },
            { key: "pii", label: "PII Detected" },
          ]}
          rows={formattedRows}
        />
      </Card>
    </div>
  );
}

export default GovernancePage;
