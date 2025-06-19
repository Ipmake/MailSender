import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Configuration, EmailTemplate, EmailStats, EmailList } from '../types';

export const useConfiguration = () => {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConfiguration();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  return { config, loading, error, refetch: loadConfiguration };
};

export const useTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => {
    try {
      await apiService.createTemplate(template);
      await loadTemplates();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await apiService.deleteTemplate(templateId);
      await loadTemplates();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return { 
    templates, 
    loading, 
    error, 
    refetch: loadTemplates, 
    createTemplate, 
    deleteTemplate 
  };
};

export const useEmailStats = () => {
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    totalTemplates: 0,
    successRate: 100,
  });

  const loadStats = () => {
    const savedStats = localStorage.getItem('emailStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const updateStats = (newStats: Partial<EmailStats>) => {
    const updatedStats = { ...stats, ...newStats };
    setStats(updatedStats);
    localStorage.setItem('emailStats', JSON.stringify(updatedStats));
  };

  const incrementEmailsSent = (count = 1) => {
    updateStats({ totalSent: stats.totalSent + count });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, updateStats, incrementEmailsSent };
};

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (
    message: string, 
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return { snackbar, showSnackbar, hideSnackbar };
};

export const useEmailLists = () => {
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmailLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const lists = await apiService.getEmailLists();
      setEmailLists(lists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmailLists();
  }, []);

  return {
    emailLists,
    loading,
    error,
    refetch: loadEmailLists,
  };
};
