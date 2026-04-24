import Card from "../components/Card";
import { 
  BookOpen, 
  Settings, 
  Activity, 
  HelpCircle, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Monitor,
  Search,
  Lock,
  Zap
} from "lucide-react";

function ManualPage() {
  const steps = [
    { title: "Connect Source", desc: "Start by adding your database connection (PostgreSQL, MySQL, or MongoDB) in the 'Connections' tab.", icon: Database },
    { title: "Configure Rules", desc: "Navigate to 'Data Quality' or 'Governance' to see the automated scans and monitoring rules applied to your tables.", icon: Settings },
    { title: "Review Insights", desc: "Check the 'Dashboard' for a high-level overview and 'AI Recommendations' for proactive fixes.", icon: Activity },
    { title: "Execute Queries", desc: "Use the 'Query Explorer' to run read-only SQL and further investigate findings.", icon: Search }
  ];

  const tests = [
    // Structural
    { name: "Null Rate Check", icon: Activity, category: "Structural", howItHelps: "Measures percentage of empty values.", importance: "Prevents reporting gaps." },
    { name: "Primary Key Uniqueness", icon: Zap, category: "Structural", howItHelps: "Validates unique identifiers.", importance: "Prevents data corruption." },
    { name: "Duplicate Row Detection", icon: Database, category: "Structural", howItHelps: "Identifies identical records.", importance: "Prevents double-counting." },
    { name: "Schema Drift Detection", icon: Settings, category: "Structural", howItHelps: "Detects column changes.", importance: "Proactively fixes broken pipes." },
    { name: "JSON Schema Validation", icon: Search, category: "Structural", howItHelps: "Validates nested JSON structures.", importance: "Ensures semi-structured data integrity." },
    
    // Content
    { name: "Domain Value Check", icon: CheckCircle2, category: "Content", howItHelps: "Validates against allowed lists.", importance: "Maintains categorical consistency." },
    { name: "Format Validation (Regex)", icon: Search, category: "Content", howItHelps: "Pattern matching for emails/phones.", importance: "Ensures usable contact data." },
    { name: "Text Length Validation", icon: Monitor, category: "Content", howItHelps: "Checks min/max string lengths.", importance: "Prevents UI truncation/overflow." },
    { name: "Cross-Column Rule Validation", icon: ShieldCheck, category: "Content", howItHelps: "Validates multi-column logic (e.g., Start < End).", importance: "Ensures business logic consistency." },
    { name: "Language Detection", icon: Zap, category: "Content", howItHelps: "Identifies text language.", importance: "Critical for localized services." },
    
    // Statistical
    { name: "Outlier Detection", icon: AlertTriangle, category: "Statistical", howItHelps: "Flags statistical anomalies (Z-Score).", importance: "Identifies fraud or sensor errors." },
    { name: "Data Drift Detection", icon: Activity, category: "Statistical", howItHelps: "Monitors distribution shifts.", importance: "Critical for ML model reliability." },
    { name: "Entropy / Cardinality", icon: Zap, category: "Statistical", howItHelps: "Measures data randomness/variety.", importance: "Detects 'stuck' or repetitive data." },
    { name: "Correlation Consistency", icon: Activity, category: "Statistical", howItHelps: "Checks if column relationships hold.", importance: "Validates complex data dependencies." },
    
    // Security
    { name: "PII Detection", icon: Lock, category: "Security", howItHelps: "Finds emails, phones, and SSNs.", importance: "Ensures GDPR/CCPA compliance." },
    { name: "Masking Validation", icon: ShieldCheck, category: "Security", howItHelps: "Verifies sensitive data encryption.", importance: "Prevents data leakage in lower envs." },
    { name: "Profanity Detection", icon: AlertTriangle, category: "Security", howItHelps: "Flags toxic or offensive content.", importance: "Protects brand reputation." },
    
    // Operational
    { name: "Volume Anomaly", icon: Activity, category: "Operational", howItHelps: "Detects sudden row count drops.", importance: "Early warning for pipeline failure." },
    { name: "Data Freshness (SLA)", icon: Zap, category: "Operational", howItHelps: "Checks data age against thresholds.", importance: "Prevents decisions based on stale data." },
    { name: "Pipeline Latency", icon: Activity, category: "Operational", howItHelps: "Monitors end-to-end processing time.", importance: "Ensures real-time performance." }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <BookOpen size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            DataGuard Advanced Manual
          </h2>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Deep dive into our 20+ automated data quality and intelligence tests.
          </p>
        </div>
      </div>

      {/* How to use */}
      <Card title="Operational Workflow" subtitle="How DataGuard processes your data quality.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 py-4">
          {steps.map((step, i) => (
            <div key={i} className="relative space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon size={20} />
              </div>
              <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{step.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 -right-3 text-muted">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Test Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Test Catalog & Intelligence
          </h3>
          <div className="flex gap-2">
            {["Structural", "Content", "Statistical", "Security", "Operational"].map(cat => (
              <span key={cat} className="text-[10px] font-bold px-2 py-1 rounded-full bg-toggle text-muted uppercase tracking-wider">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {tests.map((test, i) => (
            <Card key={i}>
              <div className="grid md:grid-cols-[220px_1fr_1fr] gap-6 items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-toggle text-primary">
                    <test.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{test.name}</h4>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">{test.category}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-muted">Benefit</div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {test.howItHelps}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-error/70">Risk Mitigation</div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {test.importance}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Note */}
      <div 
        className="rounded-2xl border-2 border-dashed p-8 text-center space-y-3"
        style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-subtle)" }}
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Ready to Secure Your Data?
        </h4>
        <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          DataGuard runs these tests automatically in the background every time a scan is triggered. 
          You don't need to manually configure complex SQL—our engine handles it all.
        </p>
      </div>
    </div>
  );
}

export default ManualPage;
