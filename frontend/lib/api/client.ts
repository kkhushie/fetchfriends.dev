const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Always get fresh token from localStorage on each request
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : this.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/api/auth/me');
  }

  async getVerificationStatus() {
    return this.request<{ success: boolean; verification: any }>('/api/auth/verify/status');
  }

  // User endpoints
  async updateProfile(data: any) {
    return this.request<{ success: boolean; user: any }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async searchUsers(params: { q?: string; languages?: string[]; experience?: string }) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.languages) params.languages.forEach((lang) => query.append('languages', lang));
    if (params.experience) query.append('experience', params.experience);
    return this.request<{ success: boolean; users: any[] }>(`/api/users/search?${query}`);
  }

  async updateAvailability(status: string, lookingFor?: string[]) {
    return this.request<{ success: boolean; availability: any }>('/api/users/availability', {
      method: 'POST',
      body: JSON.stringify({ status, lookingFor }),
    });
  }

  // Matching endpoints
  async joinQueue(mode: string, params: any) {
    return this.request<{ success: boolean; queue: any }>('/api/match/join', {
      method: 'POST',
      body: JSON.stringify({ mode, params }),
    });
  }

  async leaveQueue() {
    return this.request<{ success: boolean }>('/api/match/leave', {
      method: 'DELETE',
    });
  }

  async getQueueStatus() {
    return this.request<{ success: boolean; inQueue: boolean; queue?: any }>('/api/match/status');
  }

  async acceptMatch(sessionId: string) {
    return this.request<{ success: boolean; session: any }>(`/api/match/accept/${sessionId}`, {
      method: 'POST',
    });
  }

  async declineMatch(sessionId: string) {
    return this.request<{ success: boolean }>(`/api/match/decline/${sessionId}`, {
      method: 'POST',
    });
  }

  // Session endpoints
  async getSession(sessionId: string) {
    return this.request<{ success: boolean; session: any }>(`/api/sessions/${sessionId}`);
  }

  async joinSession(sessionId: string) {
    return this.request<{ success: boolean; session: any }>(`/api/sessions/${sessionId}/join`, {
      method: 'POST',
    });
  }

  async leaveSession(sessionId: string) {
    return this.request<{ success: boolean }>(`/api/sessions/${sessionId}/leave`, {
      method: 'POST',
    });
  }

  // Feedback endpoints
  async submitFeedback(sessionId: string, data: any) {
    return this.request<{ success: boolean }>(`/api/feedback/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Match history
  async getMatchHistory(limit = 20, offset = 0) {
    return this.request<{ success: boolean; sessions: any[] }>(`/api/match/history?limit=${limit}&offset=${offset}`);
  }
}

export const apiClient = new ApiClient(API_URL);

