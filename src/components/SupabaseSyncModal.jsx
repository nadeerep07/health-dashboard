import React, { useState } from 'react';
import { Cloud, Check, Copy, Database, X, RefreshCw, Download, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../utils/supabaseClient';

export default function SupabaseSyncModal({ isOpen, onClose, onSaveConfig, onManualSync, onExportData, onImportData, syncStatus }) {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('transformation_supabase_url', supabaseUrl.trim());
    localStorage.setItem('transformation_supabase_key', anonKey.trim());
    setSaveSuccess(true);
    if (onSaveConfig) onSaveConfig();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Supabase Cloud Storage
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Synchronize your weight logs & habits across your Phone & Laptop
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div style={{
          background: currentConfig.isConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 215, 0, 0.08)',
          border: currentConfig.isConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 215, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.1rem',
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
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
              {currentConfig.isConfigured ? 'Supabase Connected' : 'Local Storage Mode (Device Only)'}
            </span>
          </div>

          {currentConfig.isConfigured && (
            <button
              onClick={onManualSync}
              className="btn-gold"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={13} /> {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud Now'}
            </button>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="form-input"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: saveSuccess ? 'var(--accent-green)' : 'var(--text-dim)', fontWeight: 600 }}>
              {saveSuccess ? '✓ Credentials saved & connected!' : 'Credentials saved locally in your browser.'}
            </span>

            <button type="submit" className="btn-gold" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
              <Cloud size={15} /> Save & Connect
            </button>
          </div>
        </form>

        {/* SQL Table Setup Helper */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
              1-Minute Supabase Database Setup
            </span>
            <button
              onClick={handleCopySql}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
            >
              {copiedSql ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
              {copiedSql ? 'Copied SQL!' : 'Copy SQL'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            In your free <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-primary)' }}>Supabase Dashboard</a>, go to the <strong>SQL Editor</strong> tab, paste the SQL below, and click <strong>Run</strong>:
          </p>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.7rem',
            color: '#a7f3d0',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)'
          }}>
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* Backup / Export / Import JSON Options */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Offline Backup:
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onExportData}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              <Download size={13} /> Export JSON
            </button>

            <label className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              <Upload size={13} /> Import JSON
              <input type="file" accept=".json" onChange={onImportData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
