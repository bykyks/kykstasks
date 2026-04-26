import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useStore } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './components/auth/LoginPage';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNotifications } from './hooks/useNotifications';

function AppInner() {
  useTheme();
  useKeyboardShortcuts();
  useNotifications();
  return <AppLayout />;
}

const Spinner = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L4.09 12.26a1 1 0 00.91 1.74H11v8l8.91-10.26a1 1 0 00-.91-1.74H13V2z" />
      </svg>
    </div>
  </div>
);

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const { loadAll, isLoading } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadAll();
  }, [session]);

  // Checking auth
  if (session === undefined) return <Spinner />;

  // Not logged in
  if (!session) return <LoginPage />;

  // Loading data
  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.09 12.26a1 1 0 00.91 1.74H11v8l8.91-10.26a1 1 0 00-.91-1.74H13V2z" />
          </svg>
        </div>
        <p style={{ color: '#adb5bd', fontSize: 13, fontFamily: 'sans-serif' }}>Chargement de Kykstasks…</p>
      </div>
    );
  }

  return <AppInner />;
}
