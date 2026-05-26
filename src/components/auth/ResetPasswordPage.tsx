import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface ResetPasswordPageProps {
  onDone: () => void;
}

export function ResetPasswordPage({ onDone }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    onDone();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: '#d78a27' }}
          >
            <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kykstasks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Choisis ton nouveau mot de passe</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            Nouveau mot de passe
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="••••••••"
                className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                           rounded-lg px-3 py-2.5 text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] focus:outline-none
                           focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-1.5">
                Confirmer
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                           rounded-lg px-3 py-2.5 text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] focus:outline-none
                           focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
