const API_BASE = "/api";

export const getDashboardMetrics = async () => {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  return res.json();
};

export const getQualityData = async () => {
  const res = await fetch(`${API_BASE}/quality-checks`);
  if (!res.ok) throw new Error("Failed to fetch quality data");
  return res.json();
};

export const getGovernanceData = async () => {
  const res = await fetch(`${API_BASE}/governance`);
  if (!res.ok) throw new Error("Failed to fetch governance data");
  return res.json();
};

export const getRecommendations = async () => {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};

export const executeQuery = async (query) => {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Query execution failed");
  }
  return res.json();
};
