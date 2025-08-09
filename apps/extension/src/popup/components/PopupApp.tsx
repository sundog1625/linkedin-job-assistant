import React, { useState, useEffect } from 'react';
import { MessageType, Job, JobStatus } from '../../utils/types';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Settings,
  Globe
} from 'lucide-react';

export const PopupApp: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'applied' | 'settings'>('saved');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadJobs();
    loadSettings();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    chrome.runtime.sendMessage(
      { type: MessageType.GET_JOBS },
      (response) => {
        if (response.success) {
          setJobs(response.data || []);
        }
        setLoading(false);
      }
    );
  };

  const loadSettings = async () => {
    const result = await chrome.storage.local.get('settings');
    if (result.settings?.language) {
      setLanguage(result.settings.language);
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: 'https://linkedin-job-assistant.vercel.app' });
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.SAVED:
        return <Clock size={16} className="text-blue-500" />;
      case JobStatus.APPLIED:
        return <CheckCircle size={16} className="text-green-500" />;
      case JobStatus.INTERVIEWING:
        return <TrendingUp size={16} className="text-yellow-500" />;
      case JobStatus.OFFER:
        return <CheckCircle size={16} className="text-green-600" />;
      case JobStatus.REJECTED:
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Briefcase size={16} className="text-gray-500" />;
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'saved') {
      return job.status === JobStatus.SAVED;
    } else if (activeTab === 'applied') {
      return job.status !== JobStatus.SAVED;
    }
    return true;
  });

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    chrome.storage.local.set({
      settings: { language: newLang }
    });
  };

  const getTranslation = (key: string) => {
    const translations: any = {
      en: {
        title: 'LinkedIn Job Assistant',
        saved: 'Saved',
        applied: 'Applied',
        settings: 'Settings',
        openDashboard: 'Open Dashboard',
        noJobs: 'No jobs found',
        startBrowsing: 'Start browsing LinkedIn jobs to save them here',
        language: 'Language',
        autoAnalyze: 'Auto-analyze jobs',
        showMatchScore: 'Show match score'
      },
      zh: {
        title: 'LinkedIn 求职助手',
        saved: '已保存',
        applied: '已申请',
        settings: '设置',
        openDashboard: '打开仪表板',
        noJobs: '未找到职位',
        startBrowsing: '开始浏览LinkedIn职位并保存到这里',
        language: '语言',
        autoAnalyze: '自动分析职位',
        showMatchScore: '显示匹配分数'
      },
      es: {
        title: 'Asistente de Empleo LinkedIn',
        saved: 'Guardado',
        applied: 'Aplicado',
        settings: 'Configuración',
        openDashboard: 'Abrir Panel',
        noJobs: 'No se encontraron trabajos',
        startBrowsing: 'Comience a navegar trabajos en LinkedIn para guardarlos aquí',
        language: 'Idioma',
        autoAnalyze: 'Analizar trabajos automáticamente',
        showMatchScore: 'Mostrar puntuación de coincidencia'
      }
    };

    return translations[language]?.[key] || translations['en'][key];
  };

  if (activeTab === 'settings') {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1 className="popup-title">{getTranslation('settings')}</h1>
          <button
            onClick={() => setActiveTab('saved')}
            className="popup-btn-icon"
          >
            ←
          </button>
        </div>

        <div className="settings-container">
          <div className="setting-item">
            <label className="setting-label">
              <Globe size={16} />
              {getTranslation('language')}
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input type="checkbox" defaultChecked />
              {getTranslation('autoAnalyze')}
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input type="checkbox" defaultChecked />
              {getTranslation('showMatchScore')}
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1 className="popup-title">{getTranslation('title')}</h1>
        <button
          onClick={() => setActiveTab('settings')}
          className="popup-btn-icon"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="popup-tabs">
        <button
          className={`popup-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          {getTranslation('saved')} ({jobs.filter(j => j.status === JobStatus.SAVED).length})
        </button>
        <button
          className={`popup-tab ${activeTab === 'applied' ? 'active' : ''}`}
          onClick={() => setActiveTab('applied')}
        >
          {getTranslation('applied')} ({jobs.filter(j => j.status !== JobStatus.SAVED).length})
        </button>
      </div>

      <div className="popup-content">
        {loading ? (
          <div className="popup-loading">Loading...</div>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-list">
            {filteredJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="job-item">
                <div className="job-header">
                  {getStatusIcon(job.status)}
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>
                  {job.match_score && (
                    <div className="job-score">
                      {job.match_score.overall}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="popup-empty">
            <Briefcase size={48} className="empty-icon" />
            <p>{getTranslation('noJobs')}</p>
            <p className="empty-hint">{getTranslation('startBrowsing')}</p>
          </div>
        )}
      </div>

      <div className="popup-footer">
        <button onClick={openDashboard} className="popup-btn-primary">
          <ExternalLink size={16} />
          {getTranslation('openDashboard')}
        </button>
      </div>
    </div>
  );
};