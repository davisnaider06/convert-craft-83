import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function readApiResponse(response: Response): Promise<{
  ok: boolean;
  status: number;
  data: any;
  error?: string;
}> {
  const raw = await response.text();
  let data: any = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  if (response.ok) {
    return { ok: true, status: response.status, data };
  }

  const looksHtml = typeof data?.raw === "string" && data.raw.includes("<!DOCTYPE");
  const error =
    data?.error ||
    data?.message ||
    (looksHtml
      ? "A API respondeu HTML em vez de JSON. Verifique o deploy do backend e o VITE_API_URL."
      : `Erro HTTP ${response.status}`);

  return { ok: false, status: response.status, data, error };
}

export function useApiClient() {
  const { getToken } = useAuth();

  async function apiFetch(path: string, init: RequestInit = {}) {
    const token = await getToken();
    if (!token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });

    return response;
  }

  return { apiFetch, API_URL };
}
