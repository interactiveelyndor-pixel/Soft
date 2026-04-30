import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Briefcase, Activity, TrendingUp, TrendingDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const CEODashboard = () => {
  const [stats, setStats] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/projects/')
        ]);

        const s = statsRes.data;
        setStats([
          { label: 'Active Games', value: s.active_games.toString(), delta: '+1 this quarter', positive: true, icon: Gamepad2 },
          { label: 'Studio Morale', value: '92%', delta: 'Stable', positive: true, icon: Activity },
          { label: 'Open Roles', value: s.open_roles.toString(), delta: '2 urgent', positive: false, icon: Briefcase },
          { label: 'Active Clients', value: s.active_clients.toString(), delta: '+4 this month', positive: true, icon: Users },
        ]);
        setProjects(projectsRes.data.slice(0, 4)); // Only show first 4
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Elyndor Interactive</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Studio Dashboard</h1>
        </div>
        <button 
          onClick={() => {
            toast.loading("Compiling AI Studio Briefing...", { duration: 2000 });
            setTimeout(() => toast.success("Briefing compiled successfully"), 2000);
          }}
          className="btn-primary text-xs"
        >
          <Sparkles size={14} />
          Generate AI Briefing
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, positive, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <Icon size={17} className="text-zinc-400" />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {delta}
              </div>
            </div>
            <p className="label mb-1">{label}</p>
            <p className="text-[2rem] font-semibold text-white font-heading leading-none">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Projects - 2 cols */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-heading font-semibold text-white">Production Pipeline</h2>
              <p className="text-zinc-500 text-xs mt-0.5">{projects.length} active archives</p>
            </div>
            <button onClick={() => toast("Navigating to full pipeline view")} className="btn-ghost py-2 px-4 text-xs">View All</button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                onClick={() => toast.info(`Viewing details for ${p.name}`)}
                className="flex items-center gap-5 px-7 py-5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">{p.name}</h3>
                      <p className="text-xs text-zinc-500">{p.category || 'Game'} · {p.team_size || 0} members</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.progress >= 70 ? 'bg-emerald-500/10 text-emerald-400' : p.progress >= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-700/30 text-zinc-500'}`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono w-8 text-right">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-accent transition-colors flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column - 1 col */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="card p-6 border-accent/10 bg-[radial-gradient(circle_at_100%_0%,rgba(198,163,79,0.04)_0%,transparent_60%)]">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-sm font-heading font-semibold text-white">AI Studio Brief</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Production pipeline is healthy. {projects.filter(p => p.progress > 70).length} projects nearing completion.
                </p>
                <div className="h-px bg-white/[0.04]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Recent activities indicate high engagement across the core production team.
                </p>
                <div className="h-px bg-white/[0.04]" />
              </div>
              <div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Team morale this week remains stable. No critical burnout indicators.
                </p>
              </div>
            </div>
            <button onClick={() => toast("Generating full analytics report...")} className="btn-ghost w-full mt-6 py-3 text-xs">Full Analytics Report</button>
          </div>

          {/* Recent Activity Mock (Keep as mock for now or fetch if available) */}
          <div className="card p-6">
            <h2 className="text-sm font-heading font-semibold text-white mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { time: '09:14 AM', event: 'Arjun checked in for the day' },
                { time: 'Yesterday', event: 'New project "Arcane Puppet" milestones updated' },
                { time: '2 days ago', event: 'Performance review for Sarah complete' },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5" />
                  <div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{a.event}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
