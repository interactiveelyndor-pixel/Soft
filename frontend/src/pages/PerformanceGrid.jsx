import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, UserMinus, MoreHorizontal, Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

const zoneMeta = {
  green: {
    badge: 'badge-green',
    bar: 'bg-emerald-500',
    label: 'Optimal',
    icon: <ShieldCheck size={13} />,
    ring: 'ring-emerald-500/20',
    avatar: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  red: {
    badge: 'badge-red',
    bar: 'bg-red-500',
    label: 'At Risk',
    icon: <ShieldAlert size={13} />,
    ring: 'ring-red-500/20',
    avatar: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  black: {
    badge: 'badge-muted',
    bar: 'bg-zinc-600',
    label: 'Terminated',
    icon: <UserMinus size={13} />,
    ring: 'ring-zinc-700/30',
    avatar: 'bg-zinc-800 text-zinc-500 border-zinc-700/50',
  },
};

const PerformanceGrid = () => {
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get('/performance/');
        setPerformers(response.data);
      } catch (error) {
        console.error('Failed to fetch performance data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <p className="label mb-1.5">HR Command</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Performance Matrix</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search operatives..."
              className="input pl-9 py-2.5 w-60 text-xs"
            />
          </div>
          <button className="btn-ghost py-2.5 px-4">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Zone Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Green — Optimal performance', cls: 'badge-green', icon: <ShieldCheck size={13} /> },
          { label: 'Red — Needs intervention', cls: 'badge-red', icon: <ShieldAlert size={13} /> },
          { label: 'Black — Archived / Terminated', cls: 'badge-muted', icon: <UserMinus size={13} /> },
        ].map(({ label, cls, icon }) => (
          <div key={label} className={cls}>{icon}{label}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {performers.map((p, i) => {
          const meta = zoneMeta[p.zone] || zoneMeta.black;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`card card-hover p-6 cursor-pointer ring-1 ${meta.ring} ${p.zone === 'black' ? 'opacity-60' : ''}`}
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl border font-heading font-bold text-lg flex items-center justify-center flex-shrink-0 ${meta.avatar}`}>
                  {p.user_name?.charAt(0) || '?'}
                </div>
                <div className={meta.badge}>
                  {meta.icon}
                  {meta.label}
                </div>
              </div>

              {/* Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-0.5">{p.user_name}</h3>
                <p className="text-xs text-zinc-500">{p.user_department || 'Operative'}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mb-5 py-4 border-t border-white/[0.05]">
                <div>
                  <p className="label mb-1">Last Score</p>
                  <p className="text-xl font-semibold text-white">{p.score}</p>
                </div>
                <div>
                  <p className="label mb-1">Efficiency</p>
                  <p className={`text-xl font-semibold ${p.zone === 'green' ? 'text-emerald-400' : p.zone === 'red' ? 'text-red-400' : 'text-zinc-500'}`}>
                    {Math.round(p.score)}%
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="progress-bar">
                  <motion.div
                    className={`h-full rounded-full ${meta.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.score}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {p.zone === 'red' ? (
                  <button className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                    Review Ops
                  </button>
                ) : (
                  <button className="flex-1 py-2 rounded-lg btn-ghost text-xs flex items-center justify-center gap-1">
                    Full Report <ArrowUpRight size={12} />
                  </button>
                )}
                <button className="p-2 rounded-lg btn-ghost"><MoreHorizontal size={15} /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceGrid;
