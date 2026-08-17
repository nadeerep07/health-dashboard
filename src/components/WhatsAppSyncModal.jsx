import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Sparkles, Check, Copy, Shield, Send, Bot } from 'lucide-react';

export default function WhatsAppSyncModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', text: '👋 Hi! I am your APEX 100 WhatsApp AI Health Coach. Send me your meals, walks, or weight updates anytime!' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const webhookUrl = 'https://health-dashboard-eta-nine.vercel.app/api/whatsapp';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulation = (e) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setChatHistory(prev => [...prev, { from: 'user', text: userText }]);
    setTestInput('');
    setIsSimulating(true);

    setTimeout(() => {
      let botReply = '';
      const low = userText.toLowerCase();

      if (low.includes('walk') || low.includes('km')) {
        botReply = '🔥 Great session! Logged 5.40 km walk (Pace: 11:07/km, 492 kcal). Daily walk habit checked ✅';
      } else if (low.includes('weight') || low.includes('kg')) {
        botReply = '⚖️ Recorded morning fasted weight: 110.80 kg. 10.8 kg to goal (100 kg)!';
      } else if (low.includes('left') || low.includes('remaining') || low.includes('status')) {
        botReply = '📊 Today\'s Status:\n• Consumed: 1,459 / 2,100 kcal (641 kcal remaining)\n• Protein: 95.9 / 130g (34.1g remaining)\n• Water: 2.2 / 3.5 L\n💡 Keep up the momentum!';
      } else {
        botReply = `✅ Logged to APEX 100 Dashboard!\n• Estimated: 464 kcal • 25.0g Protein\n🔥 Remaining: 1,180 kcal for today.`;
      }

      setChatHistory(prev => [...prev, { from: 'bot', text: botReply }]);
      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#25d366'
            }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)' }}>
                WhatsApp AI Health Coach
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Log meals, walks, and check calories directly from WhatsApp
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Webhook Endpoint Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
            Live Vercel Webhook Endpoint
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gold-primary)' }}
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="btn-gold"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* 3-Step Setup Guide */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.6rem' }}>
            Quick 2-Minute Free Twilio WhatsApp Setup:
          </h3>
          <ol style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.45rem', lineHeight: 1.4 }}>
            <li>
              Create a free account on <a href="https://www.twilio.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-primary)', textDecoration: 'underline' }}>Twilio Console</a>.
            </li>
            <li>
              Go to <strong>Messaging ➔ Try WhatsApp ➔ Send a WhatsApp Message</strong>.
            </li>
            <li>
              Paste the copied <strong>Webhook URL</strong> into <em>"When a message comes in"</em> and click <strong>Save</strong>.
            </li>
            <li>
              In Vercel Project Settings, ensure <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>, and <code>VITE_GEMINI_API_KEY</code> are saved.
            </li>
          </ol>
        </div>

        {/* Live WhatsApp Chat Simulator */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#25d366', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
            <Bot size={14} /> WhatsApp AI Chat Simulator
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', marginBottom: '0.75rem', paddingRight: '0.25rem' }}>
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.from === 'user' ? '#075e54' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.78rem',
                  maxWidth: '85%',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>
            ))}
            {isSimulating && (
              <div style={{ alignSelf: 'flex-start', color: '#25d366', fontSize: '0.72rem', fontStyle: 'italic' }}>
                AI Coach is typing...
              </div>
            )}
          </div>

          <form onSubmit={handleSendSimulation} style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              placeholder="Type test message (e.g. '300g rice with 2 mathi fry', 'Walked 5.4 km')"
              className="form-input"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn-gold"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
              disabled={!testInput.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.45rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
