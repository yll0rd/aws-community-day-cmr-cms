interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: 'Network error' };
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Speakers
  async getSpeakers(yearId: string) {
    return this.request(`/speakers?yearId=${yearId}`);
  }

  async createSpeaker(data: any) {
    return this.request('/speakers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSpeaker(id: string, data: any) {
    return this.request(`/speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSpeaker(id: string) {
    return this.request(`/speakers/${id}`, { method: 'DELETE' });
  }

  // Agenda
  async getAgenda(yearId: string) {
    return this.request(`/agenda?yearId=${yearId}`);
  }

  async createAgendaItem(data: any) {
    return this.request('/agenda', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Gallery
  async getGalleryImages(yearId: string) {
    return this.request(`/gallery?yearId=${yearId}`);
  }

  async createGalleryImage(data: any) {
    return this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File upload
  async uploadFile(file: File, directory?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (directory) {
      formData.append('directory', directory);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }
}

export const api = new ApiClient();