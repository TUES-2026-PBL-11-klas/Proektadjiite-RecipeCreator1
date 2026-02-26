import {
  PantryItem,
  Recipe,
  GenerateResponse,
  RecipeFiltersState,
  Product,
} from "@/types";

// Determine base URL for API. `VITE_API_BASE_URL` is injected at build time;
// it will normally be something like `http://localhost:5001` during local
// development. However, if you open the frontend from another device the
// hostname in that variable may no longer be correct ("localhost" points at
// the client). To handle this we infer a base URL using the current page's
// hostname together with the backend port. The port is derived from the
// configured value if available, otherwise a sensible default is used.
const DEFAULT_API_PORT = 5001;
let port = DEFAULT_API_PORT;
if (import.meta.env.VITE_API_BASE_URL) {
  try {
    const parsed = new URL(import.meta.env.VITE_API_BASE_URL);
    if (parsed.port) port = parseInt(parsed.port, 10);
  } catch {
    // ignore invalid URL
  }
}
const inferredBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:${port}`
    : "";
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
  : inferredBase;

const AUTH_TOKEN_KEY = "rc_auth_token";
const AUTH_USER_KEY = "rc_auth_user";

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const candidates: string[] = [];
  if (API_BASE) {
    const base = API_BASE.replace(/\/+$/g, "")
      .replace(/^\s+|\s+$/g, "")
      .replace(/\s+/g, "");
    const normalizedBase = base.replace(/\/$/, "");
    candidates.push(`${normalizedBase}${normalizedPath}`);
  }
  candidates.push(normalizedPath);

  let lastError: any;
  let res: Response | null = null;
  for (const url of candidates) {
    try {
      res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options?.headers || {}) },
      });
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!res) {
    throw lastError || new Error("Network request failed");
  }

  if (res.status === 401) {
    let message = "Unauthorized";
    try {
      const data = await res.json();
      if (data && typeof data.error === "string") message = data.error;
    } catch {}
    const isAuthEndpoint = /^\/api\/auth\/(login|register)/.test(path);
    if (!isAuthEndpoint) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      message = "Session expired. Please log in again.";
    }
    throw new Error(message);
  }

  if (!res.ok) {
    let errorMsg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

// ─── Mock Data (REMOVED) ──────────────────────────────────────────────────────

// All mock data removed - using real backend API

// ─── Authentication ──────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

  return response;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

  return response;
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export async function getRecipes(
  filters?: Partial<RecipeFiltersState>,
): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.maxTime) params.set("max_prep_time", String(filters.maxTime));

  const query = params.toString();
  return apiFetch<Recipe[]>(`/api/recipes${query ? "?" + query : ""}`);
}

export async function getRecipeById(id: string): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`);
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiFetch<void>(`/api/recipes/${id}`, {
    method: "DELETE",
  });
}

export async function renameRecipe(id: string, title: string): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

// ─── Pantry ──────────────────────────────────────────────────────────────────

export async function getPantry(): Promise<PantryItem[]> {
  return apiFetch<PantryItem[]>("/api/pantry");
}

export async function addToPantry(
  productId: string,
  quantity: number,
): Promise<PantryItem> {
  return apiFetch<PantryItem>("/api/pantry", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updatePantryItem(
  productId: string,
  quantity: number,
): Promise<PantryItem> {
  return apiFetch<PantryItem>(`/api/pantry/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromPantry(productId: string): Promise<void> {
  await apiFetch<void>(`/api/pantry/${productId}`, {
    method: "DELETE",
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function searchProducts(query?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set("search", query);

  const queryStr = params.toString();
  return apiFetch<Product[]>(`/api/products${queryStr ? "?" + queryStr : ""}`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(
  name: string,
  unit: string,
): Promise<Product> {
  return apiFetch<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify({ name, unit }),
  });
}

export async function updateProduct(
  id: string,
  data: { name?: string; unit?: string },
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

// ─── Recipe Generation ───────────────────────────────────────────────────────

export async function generateRecipeFromPantry(
  productIds: string[],
  preferences?: string,
): Promise<Recipe> {
  return apiFetch<Recipe>("/api/recipes/generate/pantry-only", {
    method: "POST",
    body: JSON.stringify({
      product_ids: productIds,
      preferences,
    }),
  });
}

export async function generateRecipeAIEnhanced(
  productIds: string[],
  preferences?: string,
): Promise<Recipe> {
  return apiFetch<Recipe>("/api/recipes/generate/ai-enhanced", {
    method: "POST",
    body: JSON.stringify({
      product_ids: productIds,
      preferences,
    }),
  });
}

// ─── Search Helpers ───────────────────────────────────────────────────────────

export async function searchIngredientSuggestions(
  query: string,
): Promise<Product[]> {
  if (!query.trim()) return [];
  try {
    return await searchProducts(query);
  } catch {
    return [];
  }
}
