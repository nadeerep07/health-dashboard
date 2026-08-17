import React, { useState, useEffect } from 'react';
import { Cloud, Check, Copy, Database, X, RefreshCw, Download, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../utils/supabaseClient';

export default function SupabaseSyncModal({ isOpen, onClose, onSaveConfig, onManualSync, onExportData, onImportData, syncStatus }) {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('transformation_supabase_url', supabaseUrl.trim());
    localStorage.setItem('transformation_supabase_key', anonKey.trim());
    setSaveSuccess(true);
    if (onSaveConfig) onSaveConfig();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Supabase Cloud Storage
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sync logs & habits across your Phone and Computer
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div style={{
          background: currentConfig.isConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 215, 0, 0.08)',
          border: currentConfig.isConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 215, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: currentConfig.isConfigured ? '#10b981' : '#f59e0b',
              boxShadow: currentConfig.isConfigured ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>
              {currentConfig.isConfigured ? 'Supabase Connected' : 'Local Storage Mode (Device Only)'}
            </span>
          </div>

          {currentConfig.isConfigured && (
            <button
              type="button"
              onClick={onManualSync}
              className="btn-gold"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={13} /> {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              className="form-input"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="form-input"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
            />
          </div>

          {saveSuccess && (
            <div style={{ color: 'var(--accent-green)', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={16} /> Saved! Syncing in background...
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ flex: 1 }}>
              Save & Connect
            </button>
          </div>
        </form>

        {/* JSON Backup Export/Import */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>Local Backup</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Export or restore all data as JSON</div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onExportData} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              <Download size={13} /> Export JSON
            </button>
            <label className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              <Upload size={13} /> Restore JSON
              <input type="file" accept=".json" onChange={onImportData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
