function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <div
        className={`${sizes[size]} animate-spin rounded-full`}
        style={{
          borderColor: "var(--border-default)",
          borderTopColor: "var(--primary)",
        }}
      />
      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        Loading…
      </p>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "var(--bg-hover)" }}
    />
  );
}

export default LoadingSpinner;
