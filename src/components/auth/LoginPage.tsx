import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

type Mode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<Mode>('login');

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccess('Un lien de réinitialisation a été envoyé à ton adresse email.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue');
    }
    setLoading(false);
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
          <p className="text-sm text-[var(--text-muted)] mt-1">Ton gestionnaire de tâches personnel</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            {mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="ton@email.com"
                className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                           rounded-lg px-3 py-2.5 text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] focus:outline-none
                           focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                    Mot de passe
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      Oublié ?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                             rounded-lg px-3 py-2.5 text-[var(--text-primary)]
                             placeholder:text-[var(--text-muted)] focus:outline-none
                             focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-xs text-green-600 bg-green-500/10 rounded-lg px-3 py-2">{success}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading
                ? 'Chargement…'
                : mode === 'login'
                  ? 'Se connecter'
                  : mode === 'signup'
                    ? 'Créer le compte'
                    : 'Envoyer le lien'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            {mode !== 'forgot' ? (
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
              </button>
            ) : (
              <button
                onClick={() => switchMode('login')}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Retour à la connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
