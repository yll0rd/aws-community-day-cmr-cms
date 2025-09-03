// lib/api.ts
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
                credentials: 'include', // Important for cookie-based auth
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

    async updateAgendaItem(id: string, data: any) {
        return this.request(`/agenda/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAgendaItem(id: string) {
        return this.request(`/agenda/${id}`, { method: 'DELETE' });
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

    async updateGalleryImage(id: string, data: any) {
        return this.request(`/gallery/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteGalleryImage(id: string) {
        return this.request(`/gallery/${id}`, { method: 'DELETE' });
    }

    // Years/Events
    async getYears() {
        return this.request('/years');
    }

    async createYear(data: any) {
        return this.request('/years', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateYear(id: string, data: any) {
        return this.request(`/years/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteYear(id: string) {
        return this.request(`/years/${id}`, { method: 'DELETE' });
    }

    // File upload (special handling for FormData)
    async uploadFile(file: File, directory?: string) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (directory) {
                formData.append('directory', directory);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include', // Important for auth
                body: formData,
                // Don't set Content-Type header for FormData - let browser set it with boundary
            });

            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || 'Upload failed' };
            }

            return { data };
        } catch (error) {
            console.error('File upload error:', error);
            return { error: 'Upload failed' };
        }
    }
}

export const api = new ApiClient();