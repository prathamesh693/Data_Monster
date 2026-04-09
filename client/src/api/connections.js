export const connectDatabase = async (payload) => {
  const response = await fetch("/api/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok && !data?.ok) {
    throw new Error(data?.message || "Connection request failed.");
  }

  return data;
};
