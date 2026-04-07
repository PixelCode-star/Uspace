import { useState, useEffect } from 'react';

export default function GlobalDialog() {
  const [dialogs, setDialogs] = useState([]);

  useEffect(() => {
    const handleShowDialog = (e) => {
      const { type = 'alert', title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' } = e.detail;
      const id = Date.now().toString() + Math.random().toString();
      
      setDialogs(prev => [...prev, {
        id, type, title, message, onConfirm, onCancel, confirmText, cancelText
      }]);
    };

    window.addEventListener('show-dialog', handleShowDialog);
    return () => window.removeEventListener('show-dialog', handleShowDialog);
  }, []);

  const closeDialog = (id) => {
    setDialogs(prev => prev.filter(d => d.id !== id));
  };

  if (dialogs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {dialogs.map((dialog, index) => (
        <div key={dialog.id} className="page-enter" style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--bg-highlight)',
          borderRadius: 'var(--r-xl)', padding: '32px', maxWidth: '400px', width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: index === dialogs.length - 1 ? 'block' : 'none' // Only show top dialog
        }}>
          {dialog.title && <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>{dialog.title}</h3>}
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.5 }}>
            {dialog.message}
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {dialog.type === 'confirm' && (
              <button className="btn btn-ghost" onClick={() => {
                if (dialog.onCancel) dialog.onCancel();
                closeDialog(dialog.id);
              }}>
                {dialog.cancelText}
              </button>
            )}
            
            <button className="btn btn-primary" onClick={async () => {
              if (dialog.type === 'confirm') {
                 // show loading state on button potentially, but for simplicity we just execute and close
                 if (dialog.onConfirm) {
                    await dialog.onConfirm();
                 }
              }
              closeDialog(dialog.id);
            }}>
              {dialog.confirmText}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
