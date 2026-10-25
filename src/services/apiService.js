/**
 * InvestWise - API Integration Service
 * Seamlessly connects to Python Flask REST API if available, or operates in Local Storage mode.
 */

import { storageService } from './storageService';

let cachedBackendStatus = null; // null | true | false

export const apiService = {
  getBaseUrl() {
    const settings = storageService.getSettings();
    return settings.backendApiUrl || 'http://127.0.0.1:5000/api';
  },

  /**
   * Checks if Flask REST API is responding
   */
  async checkBackendHealth() {
    const url = `${this.getBaseUrl()}/health`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        cachedBackendStatus = true;
        return { isOnline: true, data };
      }
    } catch {
      // Offline / not running yet
    }
    cachedBackendStatus = false;
    return { isOnline: false, message: 'Flask backend is not running or unreachable. Using fast Local Storage mode.' };
  },

  /**
   * Fetch all projects (from Flask if online, otherwise localStorage)
   */
  async getProjects() {
    const health = await this.checkBackendHealth();
    if (health.isOnline) {
      try {
        const res = await fetch(`${this.getBaseUrl()}/projects`);
        if (res.ok) {
          const data = await res.json();
          return { data, source: 'backend' };
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local storage', err);
      }
    }
    return { data: storageService.getProjects(), source: 'local' };
  },

  /**
   * Save a project
   */
  async saveProject(project) {
    const health = await this.checkBackendHealth();
    if (health.isOnline) {
      try {
        const res = await fetch(`${this.getBaseUrl()}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
        if (res.ok) {
          const saved = await res.json();
          // Keep local storage synchronized
          storageService.saveProject(saved);
          return { data: saved, source: 'backend' };
        }
      } catch (err) {
        console.warn('Backend save failed, falling back to local', err);
      }
    }
    const saved = storageService.saveProject(project);
    return { data: saved, source: 'local' };
  },

  /**
   * Delete a project
   */
  async deleteProject(id) {
    const health = await this.checkBackendHealth();
    if (health.isOnline) {
      try {
        await fetch(`${this.getBaseUrl()}/projects/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend delete error', err);
      }
    }
    const updated = storageService.deleteProject(id);
    return { data: updated, source: 'local' };
  },

  isBackendOnline() {
    return cachedBackendStatus === true;
  },
};
