import { PantryItem, Recipe, GenerateResponse, RecipeFiltersState, Product } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_TOKEN_KEY = 'rc_auth_token';
const AUTH_USER_KEY = 'rc_auth_user';

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
  if (!API_BASE) throw new Error('API base URL not configured');
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });
  
  if (res.status === 401) {
    // Token invalid/expired - clear auth
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    throw new Error('Session expired. Please log in again.');
  }
  
  if (!res.ok) {
    let errorMsg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      // Could not parse error response
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

// ─── Mock Data (REMOVED) ──────────────────────────────────────────────────────

// All mock data removed - using real backend API

// ─── Authentication ──────────────────────────────────────────────────────────

export async function registerUser(email: string, username: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
  
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  
  return response;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
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

export async function getRecipes(filters?: Partial<RecipeFiltersState>): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.maxTime) params.set('maxTime', String(filters.maxTime));
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  
  const query = params.toString();
  return apiFetch<Recipe[]>(`/api/recipes${query ? '?' + query : ''}`);
}

export async function getRecipeById(id: string): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`);
}

export async function createRecipe(data: {
  title: string;
  description?: string;
  instructions: string[] | string;
  prep_time_minutes: number;
  difficulty_level: string;
  image_url?: string;
  ingredients?: Array<{ product_id: string; quantity: number }>;
}): Promise<Recipe> {
  return apiFetch<Recipe>('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiFetch<void>(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
}

export async function renameRecipe(id: string, title: string): Promise<Recipe> {
  return apiFetch<Recipe>(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });
}

// ─── Pantry ──────────────────────────────────────────────────────────────────

export async function getPantry(): Promise<PantryItem[]> {
  return apiFetch<PantryItem[]>('/api/pantry');
}

export async function addToPantry(productId: string, quantity: number): Promise<PantryItem> {
  return apiFetch<PantryItem>('/api/pantry', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updatePantryItem(productId: string, quantity: number): Promise<PantryItem> {
  return apiFetch<PantryItem>(`/api/pantry/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromPantry(productId: string): Promise<void> {
  await apiFetch<void>(`/api/pantry/${productId}`, {
    method: 'DELETE',
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function searchProducts(query?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  
  const queryStr = params.toString();
  return apiFetch<Product[]>(`/api/products${queryStr ? '?' + queryStr : ''}`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(name: string, unit: string): Promise<Product> {
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify({ name, unit }),
  });
}

export async function updateProduct(id: string, name?: string, unit?: string): Promise<Product> {
  const data = {};
  if (name) (data as any).name = name;
  if (unit) (data as any).unit = unit;
  
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Recipe Generation ───────────────────────────────────────────────────────

export async function generateRecipeFromPantry(
  productIds: string[],
  preferences?: string
): Promise<Recipe> {
  return apiFetch<Recipe>('/api/recipes/generate/pantry-only', {
    method: 'POST',
    body: JSON.stringify({
      product_ids: productIds,
      preferences,
    }),
  });
}

export async function generateRecipeAIEnhanced(
  productIds: string[],
  preferences?: string
): Promise<Recipe> {
  return apiFetch<Recipe>('/api/recipes/generate/ai-enhanced', {
    method: 'POST',
    body: JSON.stringify({
      product_ids: productIds,
      preferences,
    }),
  });
}

// ─── Search Helpers ───────────────────────────────────────────────────────────

export async function searchIngredientSuggestions(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  try {
    return await searchProducts(query);
  } catch {
    return [];
  }
}
