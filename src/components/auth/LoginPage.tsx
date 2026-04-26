import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
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
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-3">
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kykstasks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Ton gestionnaire de tâches personnel</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
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
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-1.5">
                Mot de passe
              </label>
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

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
