import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { CheckCircle2, TrendingUp, Target, Zap } from 'lucide-react';
import { useStore } from '../../store';

export function StatsView() {
  const tasks = useStore((s) => s.tasks);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });

    const completedByDay: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.completed && t.completed_at) {
        const day = t.completed_at.slice(0, 10);
        completedByDay[day] = (completedByDay[day] || 0) + 1;
      }
    });

    const chartData = days.map((day) => ({
      day,
      label: new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      count: completedByDay[day] || 0,
    }));

    // Série : jours consécutifs avec au moins 1 tâche terminée, en remontant depuis aujourd'hui
    let streak = 0;
    const checkDate = new Date(today);
    let passedToday = false;
    while (true) {
      const dayStr = checkDate.toISOString().slice(0, 10);
      if (completedByDay[dayStr] && completedByDay[dayStr] > 0) {
        streak++;
      } else if (dayStr === todayStr && !passedToday) {
        passedToday = true;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const totalCompleted = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const activeTasks = tasks.filter((t) => !t.completed).length;

    return { chartData, streak, totalCompleted, completionRate, activeTasks };
  }, [tasks]);

  return (
    <div className="px-12 py-9 max-w-[860px]">
      <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-[-0.5px] mb-7">
        Statistiques
      </h1>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={<CheckCircle2 size={15} />}
          label="Terminées"
          value={stats.totalCompleted}
          color="#4F6EF7"
        />
        <StatCard
          icon={<Target size={15} />}
          label="En cours"
          value={stats.activeTasks}
          color="#f97316"
        />
        <StatCard
          icon={<TrendingUp size={15} />}
          label="Taux"
          value={`${stats.completionRate}%`}
          color="#22c55e"
        />
        <StatCard
          icon={<Zap size={15} />}
          label="Série"
          value={stats.streak > 0 ? `${stats.streak}j` : '—'}
          color="#EAB308"
        />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-5 tracking-[-0.2px]">
          Tâches terminées — 30 derniers jours
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.chartData} barSize={8} margin={{ top: 0, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              cursor={{ fill: 'var(--surface-hover)' }}
              formatter={(value) => [
                `${Number(value)} tâche${Number(value) !== 1 ? 's' : ''}`,
                'Terminées',
              ]}
            />
            <Bar dataKey="count" fill="#4F6EF7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-4">
      <div className="flex items-center gap-1.5 mb-2.5" style={{ color }}>
        {icon}
        <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] tracking-[0.01em]">
          {label}
        </span>
      </div>
      <p className="text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.8px] leading-none">
        {value}
      </p>
    </div>
  );
}
