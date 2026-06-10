import Constants from "expo-constants";

const getBaseUrl = (): string => {
  try {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      (Constants as any).manifest?.debuggerHost;

    if (debuggerHost) {
      const host = debuggerHost.split(":")[0];
      return `http://${host}:8000/api/v1`;
    }
  } catch (_) {}
  return "http://localhost:8000/api/v1";
};

const BASE_URL = getBaseUrl();
console.log("[API] Base URL:", BASE_URL);

export interface Prato {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem_url?: string;
  criado_em: string;
  atualizado_em?: string;
}

export interface PratoCreate {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem_url?: string;
}

export type PratoUpdate = Partial<PratoCreate>;

export interface ListResponse {
  total: number;
  pratos: Prato[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erro ${response.status}`);
  }
  return response.json();
}

export const pratosApi = {
  listar: (params?: { categoria?: string; busca?: string }) => {
    const query = new URLSearchParams();
    if (params?.categoria) query.append("categoria", params.categoria);
    if (params?.busca) query.append("busca", params.busca);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<ListResponse>(`/pratos${qs}`);
  },
  obter: (id: number) => request<Prato>(`/pratos/${id}`),
  criar: (data: PratoCreate) =>
    request<Prato>("/pratos", { method: "POST", body: JSON.stringify(data) }),
  atualizar: (id: number, data: PratoUpdate) =>
    request<Prato>(`/pratos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletar: (id: number) =>
    request<{ message: string }>(`/pratos/${id}`, { method: "DELETE" }),
};
