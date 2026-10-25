/**
 * InvestWise - Local Storage Service
 * Provides offline-first persistence for investment projects and user preferences.
 */

import { SAMPLE_PROJECTS } from '../utils/sampleData';

const STORAGE_KEYS = {
  PROJECTS: 'investwise_projects_v1',
  ACTIVE_PROJECT_ID: 'investwise_active_proj_v1',
  SETTINGS: 'investwise_settings_v1',
};

const DEFAULT_SETTINGS = {
  currency: 'INR',
  defaultDiscountRate: 10.0,
  numberFormat: 'indian', // 'indian' | 'international'
  showDecimals: true,
  theme: 'light',
  backendApiUrl: 'http://127.0.0.1:5000/api',
  autoSaveDrafts: true,
};

export const storageService = {
  /**
   * Retrieves all projects; seeds sample projects on initial run
   */
  getProjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
        return SAMPLE_PROJECTS;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_PROJECTS;
    } catch (e) {
      console.warn('Storage read failed, falling back to sample data', e);
      return SAMPLE_PROJECTS;
    }
  },

  /**
   * Get single project by id
   */
  getProjectById(id) {
    const list = this.getProjects();
    return list.find((p) => p.id === id) || null;
  },

  /**
   * Get active project id or fallback to first
   */
  getActiveProjectId() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    const projects = this.getProjects();
    if (stored && projects.some((p) => p.id === stored)) {
      return stored;
    }
    return projects[0]?.id || null;
  },

  /**
   * Set active project id
   */
  setActiveProjectId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  },

  /**
   * Save or update project
   */
  saveProject(project) {
    const projects = this.getProjects();
    const now = new Date().toISOString();
    let updated;

    if (!project.id) {
      // Create new
      const newProj = {
        ...project,
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
        isSample: false,
      };
      updated = [newProj, ...projects];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      this.setActiveProjectId(newProj.id);
      return newProj;
    } else {
      // Update existing
      let found = false;
      updated = projects.map((p) => {
        if (p.id === project.id) {
          found = true;
          return {
            ...p,
            ...project,
            updatedAt: now,
            isSample: false, // User modified
          };
        }
        return p;
      });

      if (!found) {
        updated.unshift({ ...project, createdAt: now, updatedAt: now });
      }

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      return project;
    }
  },

  /**
   * Delete project by id
   */
  deleteProject(id) {
    const projects = this.getProjects();
    const updated = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));

    if (this.getActiveProjectId() === id) {
      this.setActiveProjectId(updated[0]?.id || null);
    }
    return updated;
  },

  /**
   * Duplicate existing project
   */
  duplicateProject(id) {
    const source = this.getProjectById(id);
    if (!source) return null;

    const copy = {
      ...source,
      id: `proj_${Date.now()}_copy`,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSample: false,
    };

    const projects = this.getProjects();
    const updated = [copy, ...projects];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    this.setActiveProjectId(copy.id);
    return copy;
  },

  /**
   * Reset data to original sample demonstration projects
   */
  resetToSampleData() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, SAMPLE_PROJECTS[0].id);
    return SAMPLE_PROJECTS;
  },

  /**
   * Retrieve user settings
   */
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save user settings
   */
  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },
};
