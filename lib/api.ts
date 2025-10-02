// lib/api.ts
import {headers} from "next/headers";

interface ApiResponse<T> {
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

    async createSpeakerWithPhoto(data: FormData) {
        return this.request('/speakers', {
            method: 'POST',
            body: data,
            headers: {
                // No Content-Type for FormData - browser will set it with boundary
            },
        });
    }

    async updateSpeakerWithPhoto(id: string, data: FormData) {
        return this.request(`/speakers/${id}`, {
            method: 'PUT',
            body: data,
            headers: {
                // No Content-Type for FormData
            },
        });
    }

    async getSpeakers(yearId: string) {
        return this.request(`/speakers?yearId=${yearId}`);
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
        return this.request(`/agenda?id=${id}`, {
            method: 'DELETE'
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

    // Sponsors
    async getSponsors(yearId: string) {
        return this.request(`/sponsors?yearId=${yearId}`);
    }

    async createSponsorWithLogo(data: FormData) {
        return this.request('/sponsors', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateSponsorWithLogo(id: string, data: FormData) {
        return this.request(`/sponsors/${id}`, {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteSponsor(id: string) {
        return this.request(`/sponsors/${id}`, { method: 'DELETE' });
    }

    // Organizers
    async getOrganizers(yearId: string) {
        return this.request(`/organizers?yearId=${yearId}`);
    }

    async createOrganizerWithPhoto(data: FormData) {
        return this.request('/organizers', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateOrganizerWithPhoto(id: string, data: FormData) {
        return this.request(`/organizers/${id}`, {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteOrganizer(id: string) {
        return this.request(`/organizers/${id}`, { method: 'DELETE' });
    }

    // Volunteers
    async getVolunteers(yearId: string) {
        return this.request(`/volunteers?yearId=${yearId}`);
    }

    async createVolunteerWithPhoto(data: FormData) {
        return this.request('/volunteers', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateVolunteerWithPhoto(id: string, data: FormData) {
        return this.request(`/volunteers/${id}`, {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteVolunteer(id: string) {
        return this.request(`/volunteers/${id}`, { method: 'DELETE' });
    }

    async getVenue(yearId: string) {
        return this.request(`/venue?yearId=${yearId}`);
    }

    async createVenue(data: FormData) {
        return this.request('/venue', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateVenue(data: FormData) {
        return this.request('/venue', {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteVenue(yearId: string) {
        return this.request(`/venue?yearId=${yearId}`, { method: 'DELETE' });
    }

    // Contact Info
    async getContactInfo(yearId: string) {
        return this.request(`/contact?yearId=${yearId}`);
    }

    async createContactInfo(data: FormData) {
        return this.request('/contact', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateContactInfo(data: FormData) {
        return this.request('/contact', {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteContactInfo(yearId: string) {
        return this.request(`/contact?yearId=${yearId}`, { method: 'DELETE' });
    }

    // General Settings
    async getSettings(yearId: string) {
        return this.request(`/settings?yearId=${yearId}`);
    }

    async createSettings(data: FormData) {
        return this.request('/settings', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateSettings(data: FormData) {
        return this.request('/settings', {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteSettings(yearId: string) {
        return this.request(`/settings?yearId=${yearId}`, { method: 'DELETE' });
    }

    // Users Management (Admin only)
    async getUsers() {
        return this.request('/users');
    }

    async getUser(id: string) {
        return this.request(`/users/${id}`);
    }

    async createUser(data: FormData) {
        return this.request('/users', {
            method: 'POST',
            body: data,
            headers: {}
        });
    }

    async updateUser(id: string, data: FormData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: data,
            headers: {}
        });
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, { method: 'DELETE' });
    }

    // Dashboard
    async getDashboardData(yearId: string) {
        return this.request(`/dashboard?yearId=${yearId}`, {
            headers: {}
        });
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