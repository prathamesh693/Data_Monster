const VARIANT_STYLES = {
  critical: {
    bg: "var(--error-bg)",
    color: "var(--error)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  error: {
    bg: "var(--error-bg)",
    color: "var(--error)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  warning: {
    bg: "var(--warning-bg)",
    color: "var(--warning-text)",
    border: "rgba(245, 158, 11, 0.2)",
  },
  info: {
    bg: "var(--bg-toggle)",
    color: "var(--text-primary)",
    border: "var(--border-default)",
  },
  success: {
    bg: "var(--success-bg)",
    color: "var(--success-text)",
    border: "rgba(16, 185, 129, 0.2)",
  },
  Governance: {
    bg: "var(--bg-toggle)",
    color: "var(--text-primary)",
    border: "var(--border-default)",
  },
  Trend: {
    bg: "var(--bg-toggle)",
    color: "var(--text-primary)",
    border: "var(--border-default)",
  },
  Recommendation: {
    bg: "var(--bg-toggle)",
    color: "var(--text-primary)",
    border: "var(--border-default)",
  },
  Critical: {
    bg: "var(--error-bg)",
    color: "var(--error)",
    border: "rgba(239, 68, 68, 0.2)",
  },
};

function Badge({ children, variant = "info", className = "" }) {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  return (
    <span
      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 hover:scale-110 cursor-default animate-fade-in ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
