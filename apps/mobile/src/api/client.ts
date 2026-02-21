import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:3000";

const ACCESS_TOKEN_KEY = "meusdesafios_access_token";
const REFRESH_TOKEN_KEY = "meusdesafios_refresh_token";

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  async init(): Promise<boolean> {
    const [access, refresh] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    this.accessToken = access;
    this.refreshToken = refresh;
    return !!access && !!refresh;
  }

  async setTokens(access: string, refresh: string): Promise<void> {
    this.accessToken = access;
    this.refreshToken = refresh;
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh),
    ]);
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }

  hasTokens(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await this.fetchWithAuth(path, options);

    // On 401, attempt token refresh and retry once
    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        await this.clearTokens();
        throw new AuthError();
      }
      const retryRes = await this.fetchWithAuth(path, options);
      return this.parseResponse<T>(retryRes);
    }

    return this.parseResponse<T>(res);
  }

  private async fetchWithAuth(
    path: string,
    options: RequestInit
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }
    try {
      return await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch (err) {
      throw new NetworkError(
        err instanceof Error ? err.message : "Network request failed"
      );
    }
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const json = await res.json();

    if (!json.success) {
      const code = json.error?.code || "UNKNOWN";
      const message = json.error?.message || "Unknown error";
      throw new ApiError(code, message, res.status);
    }

    return json.data as T;
  }

  private async refreshAccessToken(): Promise<boolean> {
    // Dedup concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/api/mobile/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      if (!json.success) return false;

      await this.setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch (err) {
      // Network error during refresh — don't treat as invalid token
      throw new NetworkError(
        err instanceof Error ? err.message : "Network request failed"
      );
    }
  }
}

export const api = new ApiClient();
