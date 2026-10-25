import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { NewAnalysis } from './components/NewAnalysis';
import { FinancialMetrics } from './components/FinancialMetrics';
import { ProjectComparison } from './components/ProjectComparison';
import { ScenarioAnalysis } from './components/ScenarioAnalysis';
import { SavedProjects } from './components/SavedProjects';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { BackendModal } from './components/BackendModal';

// Services & Utilities
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';

export default function App() {
  // Navigation State
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'dashboard'
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [initialMetricTab, setInitialMetricTab] = useState('npv');

  // Data State
  const [projects, setProjects] = useState(() => storageService.getProjects());
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const loadedProjects = storageService.getProjects();
    const activeId = storageService.getActiveProjectId();
    return activeId || loadedProjects[0]?.id || null;
  });
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [editingProject, setEditingProject] = useState(null);

  // Backend Integration State
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check backend health non-blockingly on mount
  useEffect(() => {
    apiService.checkBackendHealth().then((res) => {
      setIsBackendOnline(res.isOnline);
    });
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const showNotificationMessage = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers
  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    storageService.setActiveProjectId(id);
  };

  const handleStartAnalysis = (section = 'new-analysis') => {
    setEditingProject(null);
    setCurrentSection(section);
    setViewMode('dashboard');
  };

  const handleOpenMetric = (metricKey) => {
    setInitialMetricTab(metricKey);
    setCurrentSection('metrics');
    setViewMode('dashboard');
  };

  const handleSaveProject = (projectData) => {
    const saved = storageService.saveProject(projectData);
    const updatedProjects = storageService.getProjects();
    setProjects(updatedProjects);
    setActiveProjectId(saved.id);
    setEditingProject(null);
    setCurrentSection('metrics');
    showNotificationMessage(`Project "${saved.name}" analyzed & saved successfully!`);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setCurrentSection('new-analysis');
  };

  const handleDuplicateProject = (id) => {
    const copy = storageService.duplicateProject(id);
    if (copy) {
      setProjects(storageService.getProjects());
      setActiveProjectId(copy.id);
      showNotificationMessage(`Duplicated as "${copy.name}"`);
    }
  };

  const handleDeleteProject = (id) => {
    const updated = storageService.deleteProject(id);
    setProjects(updated);
    setActiveProjectId(storageService.getActiveProjectId());
    showNotificationMessage('Project appraisal removed.', 'info');
  };

  const handleResetSampleData = () => {
    const resetList = storageService.resetToSampleData();
    setProjects(resetList);
    setActiveProjectId(resetList[0]?.id);
    showNotificationMessage('Restored 4 realistic demonstration models.');
  };

  const handleSaveSettings = (newSettings) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
    showNotificationMessage('Preferences saved.');
  };

  const handleCurrencyChange = (newCurrency) => {
    handleSaveSettings({ ...settings, currency: newCurrency });
  };

  // VIEW 1: LANDING PAGE
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onStartAnalysis={handleStartAnalysis}
          onOpenMetric={handleOpenMetric}
          onOpenBackendModal={() => setShowBackendModal(true)}
        />
        <BackendModal
          isOpen={showBackendModal}
          onClose={() => setShowBackendModal(false)}
          isBackendOnline={isBackendOnline}
          onRetryHealth={async () => {
            const res = await apiService.checkBackendHealth();
            setIsBackendOnline(res.isOnline);
          }}
        />
      </>
    );
  }

  // VIEW 2: FIXED DESKTOP APPLICATION SHELL (No Long-Scrolling Dashboard!)
  return (
    <div className="dashboard-shell">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '20px',
            background: notification.type === 'info' ? '#0f172a' : 'var(--brand-teal)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {notification.text}
        </div>
      )}

      {/* Fixed Topbar */}
      <Navbar
        currentSection={currentSection}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onNavigate={(sec) => {
          setEditingProject(null);
          setCurrentSection(sec);
        }}
        currency={settings.currency}
        onChangeCurrency={handleCurrencyChange}
        onOpenBackendModal={() => setShowBackendModal(true)}
        isBackendOnline={isBackendOnline}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Body: Persistent Sidebar + Viewport */}
      <div className="dashboard-body">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => {
            setEditingProject(null);
            setCurrentSection(sec);
          }}
          projectsCount={projects.length}
          activeProject={activeProject}
          currency={settings.currency}
          onGoToLanding={() => setViewMode('landing')}
        />

        {/* Dedicated Section Viewport (Only the active section is rendered) */}
        <main className="dashboard-main-viewport">
          {currentSection === 'dashboard' && (
            <DashboardOverview
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onNavigate={(sec) => {
                setEditingProject(null);
                setCurrentSection(sec);
              }}
              currency={settings.currency}
            />
          )}

          {currentSection === 'new-analysis' && (
            <NewAnalysis
              key={editingProject?.id || 'new-analysis'}
              onSaveProject={handleSaveProject}
              currency={settings.currency}
              editingProject={editingProject}
              onCancel={() => {
                setEditingProject(null);
                setCurrentSection('dashboard');
              }}
              defaultDiscountRate={settings.defaultDiscountRate}
            />
          )}

          {currentSection === 'metrics' && (
            <FinancialMetrics
              project={activeProject}
              currency={settings.currency}
              initialMetric={initialMetricTab}
            />
          )}

          {currentSection === 'comparison' && (
            <ProjectComparison
              projects={projects}
              currency={settings.currency}
              onSelectProject={handleSelectProject}
              onNavigate={setCurrentSection}
            />
          )}

          {currentSection === 'scenarios' && (
            <ScenarioAnalysis
              project={activeProject}
              currency={settings.currency}
            />
          )}

          {currentSection === 'saved' && (
            <SavedProjects
              projects={projects}
              currency={settings.currency}
              onSelectProject={handleSelectProject}
              onEditProject={handleEditProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onResetSampleData={handleResetSampleData}
              onNavigate={(sec) => {
                setEditingProject(null);
                setCurrentSection(sec);
              }}
            />
          )}

          {currentSection === 'reports' && (
            <Reports
              projects={projects}
              activeProject={activeProject}
              currency={settings.currency}
              onSelectProject={handleSelectProject}
            />
          )}

          {currentSection === 'settings' && (
            <Settings
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetSampleData={handleResetSampleData}
              onOpenBackendModal={() => setShowBackendModal(true)}
              projects={projects}
            />
          )}
        </main>
      </div>

      {/* Backend Integration Modal */}
      <BackendModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        isBackendOnline={isBackendOnline}
        onRetryHealth={async () => {
          const res = await apiService.checkBackendHealth();
          setIsBackendOnline(res.isOnline);
        }}
      />
    </div>
  );
}
