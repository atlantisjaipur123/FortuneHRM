export const API = async (endpoint: string, method = "GET", body?: any, token?: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  };
  