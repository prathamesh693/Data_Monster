export const fetchApiHealth = async () => {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Unable to fetch API health.");
  }
  return response.json();
};

export const fetchDatabaseStatus = async () => {
  const response = await fetch("/api/db/status");
  if (!response.ok) {
    throw new Error("Unable to fetch database status.");
  }
  return response.json();
};
