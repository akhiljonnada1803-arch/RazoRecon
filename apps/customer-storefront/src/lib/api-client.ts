class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const isBrowser = typeof window !== 'undefined';
    const primaryUrl = isBrowser ? `/api/v1${endpoint}` : `http://127.0.0.1:8000/api/v1${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const token = isBrowser ? (localStorage.getItem('razorcommerce_token') || localStorage.getItem('razorrecon_token')) : null;
    const customHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      customHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (isBrowser) {
      try {
        const savedUserStr = localStorage.getItem('razorcommerce_user') || localStorage.getItem('razorrecon_user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (u?.id) {
            customHeaders['X-Customer-Id'] = u.id;
          } else if (u?.email) {
            customHeaders['X-Customer-Id'] = u.email;
          }
          if (u?.email) {
            customHeaders['X-Customer-Email'] = u.email;
          }
        }
      } catch (e) {}
    }

    try {
      const response = await fetch(primaryUrl, {
        cache: 'no-store',
        ...options,
        signal: controller.signal,
        headers: {
          ...customHeaders,
          ...(options?.headers as Record<string, string> || {}),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (isBrowser) {
          const directResp = await fetch(`http://127.0.0.1:8000/api/v1${endpoint}`, {
            ...options,
            headers: {
              ...customHeaders,
              ...(options?.headers as Record<string, string> || {})
            },
          }).catch(() => null);

          if (directResp && directResp.ok) {
            return await directResp.json();
          }
        }

        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `API Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const query = Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (query) url += `?${query}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
