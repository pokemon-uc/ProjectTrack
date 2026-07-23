import { useState } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, variant = 'danger', requireTyping }) {
  const [typed, setTyped] = useState('');

  if (!open) return null;

  const canConfirm = requireTyping ? typed === requireTyping : true;
  const confirmBtn = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <span className="text-4xl">{variant === 'danger' ? '⚠️' : 'ℹ️'}</span>
          <h3 className="text-lg font-bold text-slate-800 mt-2">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>

        {requireTyping && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Type <span className="font-mono font-bold text-red-600">{requireTyping}</span> to confirm:
            </p>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              className="input-field font-mono"
              placeholder={requireTyping}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline">Cancel</button>
          <button onClick={onConfirm} disabled={!canConfirm} className={confirmBtn}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
