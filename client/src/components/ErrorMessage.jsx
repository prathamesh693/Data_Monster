import { AlertCircle, RefreshCw } from "lucide-react";

function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center space-y-4 rounded-2xl border p-10 text-center"
      style={{
        backgroundColor: "var(--error-bg)",
        borderColor: "rgba(239, 68, 68, 0.2)",
      }}
    >
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", color: "var(--error)" }}
      >
        <AlertCircle size={28} />
      </div>
      <div>
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Something went wrong
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          {message || "Failed to load data. Please try again."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-all"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "var(--error)",
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--bg-card)"}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
