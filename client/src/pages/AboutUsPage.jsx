import Card from "../components/Card";
import { 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Users, 
  Target, 
  Globe, 
  Zap,
  Lock,
  LineChart
} from "lucide-react";

function AboutUsPage() {
  const missions = [
    {
      title: "Data Integrity",
      description: "Ensuring that your business decisions are powered by accurate, consistent, and reliable data through automated quality checks.",
      icon: ShieldCheck,
      color: "var(--primary)"
    },
    {
      title: "AI-Powered Insights",
      description: "Leveraging machine learning to proactively identify patterns, anomalies, and optimization opportunities in your data landscape.",
      icon: Sparkles,
      color: "#EAB308"
    },
    {
      title: "Secure Governance",
      description: "Protecting sensitive information with automated PII detection and classification to maintain regulatory compliance.",
      icon: Lock,
      color: "#EF4444"
    }
  ];

  const features = [
    { name: "Live Monitoring", icon: Zap, detail: "Real-time tracking of data quality across all connected sources." },
    { name: "Global Connectivity", icon: Globe, detail: "Seamless integration with PostgreSQL, MySQL, and MongoDB." },
    { name: "Smart Recommendations", icon: Target, detail: "Actionable SQL fixes and organizational advice for data issues." },
    { name: "Advanced Analytics", icon: LineChart, detail: "Comprehensive dashboards and trend analysis for data health." }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-10 space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Empowering Data-Driven Excellence
        </h2>
        <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          DataMonster is an intelligent data management platform designed to provide complete visibility, 
          security, and quality assurance for your enterprise data assets.
        </p>
      </div>

      {/* Mission Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {missions.map((m, i) => (
          <Card key={i} title={m.title}>
            <div className="space-y-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${m.color}15`, color: m.color }}
              >
                <m.icon size={24} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {m.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Importance Section */}
      <Card title="Why DataMonster Matters">
        <div className="grid gap-8 md:grid-cols-2 py-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              The Foundation of Modern Business
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              In today's digital economy, data is the most valuable asset. However, raw data is often 
              fragmented, inconsistent, or exposed. DataMonster bridges this gap by providing a 
              centralized command center for data health.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              By automating the detection of quality issues and security risks, we allow data teams 
              to focus on driving value rather than manual cleanup and firefighting.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-subtle)" }}>
                <f.icon size={20} className="mb-2" style={{ color: "var(--primary)" }} />
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-primary)" }}>{f.name}</h4>
                <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Team/Company Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Our Vision">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            To create a world where every organization can trust their data implicitly, enabling 
            limitless innovation and ethical data stewardship through intelligent automation.
          </p>
        </Card>
        <Card title="What We Do">
          <ul className="space-y-3">
            {[
              "Automated Data Quality Profiling",
              "AI-Driven Anomaly Detection",
              "PII & Sensitive Data Classification",
              "Manual & Automated Remediation Workflows"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default AboutUsPage;
