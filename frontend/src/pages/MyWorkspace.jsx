import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, CheckCircle, ShieldCheck, AlertCircle, Calendar, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ActivityCalendar = ({ history }) => {
  // Generate a map of active days
  const activeDays = new Set(history.map(h => h.date));
  
  // Calculate grid (approx 18 weeks)
  const daysToShow = 126; // 18 weeks * 7 days
  const today = new Date();
  
  const cells = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    cells.push({
      date: dateStr,
      active: activeDays.has(dateStr),
      day: d.getDay()
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.05]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-32">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            title={`${cell.date}: ${cell.active ? 'Activity Recorded' : 'No Activity'}`}
            className={`w-3 h-3 rounded-sm transition-all duration-500 ${
              cell.active 
                ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] scale-110' 
                : 'bg-white/[0.05] hover:bg-white/[0.1]'
            }`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-[9px] text-zinc-600 px-1">
        <span>3 Months Ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

const MyWorkspace = () => {
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);
  const [logText, setLogText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    logs_submitted: 0,
    performance_score: '94%',
    days_present: 0,
    pending_reviews: 0
  });

  // Auto-save logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('elyndor_worklog_draft');
    if (savedDraft) {
      setLogText(savedDraft);
    }
  }, []);

  const handleLogChange = (e) => {
    const val = e.target.value;
    setLogText(val);
    localStorage.setItem('elyndor_worklog_draft', val);
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [attendanceRes, worklogsRes] = await Promise.all([
          api.get('/attendance/me'),
          api.get('/worklogs/me')
        ]);

        setHistory(attendanceRes.data);

        // Check if checked in today
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceRes.data.find(r => r.date === today);
        if (todayRecord && !todayRecord.check_out) {
          setCheckedIn(todayRecord.id); 
        }

        setStats(prev => ({
          ...prev,
          logs_submitted: worklogsRes.data.length,
          days_present: attendanceRes.data.length
        }));
      } catch (error) {
        console.error('Failed to fetch portal data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  const handleAttendance = async () => {
    try {
      if (!checkedIn) {
        const res = await api.post('/attendance/checkin');
        setCheckedIn(res.data.id);
        setStats(prev => ({ ...prev, days_present: prev.days_present + 1 }));
        // Add to history for immediate visual feedback
        setHistory(prev => [{ date: new Date().toISOString().split('T')[0], status: 'present' }, ...prev]);
      } else {
        await api.post('/attendance/checkout');
        setCheckedIn(false);
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Attendance action failed');
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    try {
      await api.post('/worklogs/', { tasks_completed: logText });
      setSubmitted(true);
      setStats(prev => ({ ...prev, logs_submitted: prev.logs_submitted + 1 }));
      localStorage.removeItem('elyndor_worklog_draft');
      setTimeout(() => { setSubmitted(false); setLogText(''); }, 3000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Log submission failed');
    }
  };

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
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Personal Workspace</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight tracking-tight">Welcome, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-3">
          <div className="badge-muted py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {user?.role.replace('_', ' ')}
          </div>
          <div className="badge-green py-1.5">
            <ShieldCheck size={13} />
            System Healthy
          </div>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Activity Heatmap Card */}
        <div className="xl:col-span-2 card p-7">
          <ActivityCalendar history={history} />
        </div>

        {/* Attendance Card */}
        <div className="card p-7 flex flex-col items-center justify-center text-center gap-5">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
            checkedIn
              ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-500'
          }`}>
            <Clock size={28} />
          </div>
          <div>
            <h3 className="text-base font-heading font-semibold text-white mb-1">
              {checkedIn ? 'Shift Active' : 'Not Checked In'}
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Mark your presence</p>
          </div>
          <button
            onClick={handleAttendance}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              checkedIn
                ? 'bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:border-red-500/30 hover:text-red-400'
                : 'btn-primary'
            }`}
          >
            {checkedIn ? 'Clock Out' : 'Clock In Now'}
          </button>
        </div>
      </div>

      {/* Stats and Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="space-y-4">
          {[
            { label: 'Total Logs', value: stats.logs_submitted, icon: FileText, color: 'text-primary' },
            { label: 'Work Days', value: stats.days_present, icon: Calendar, color: 'text-primary/70' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card flex items-center gap-4 py-6">
              <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="label mb-0.5">{label}</p>
                <p className="text-xl font-heading font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
          
          <div className="card p-6 border-primary/10 bg-primary/[0.02]">
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              "Great work is not done by impulse, but by a series of small things brought together."
            </p>
          </div>
        </div>

        {/* Daily Log */}
        <div className="xl:col-span-2 card p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-heading font-semibold text-white">Daily Work Log</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Log your focus areas & accomplishments</p>
            </div>
            <span className="label font-mono">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
          </div>
          <form onSubmit={submitLog} className="space-y-5">
            <textarea
              value={logText}
              onChange={handleLogChange}
              placeholder="Describe your progress, blockers, and goals..."
              className="input resize-none h-32 leading-relaxed text-sm"
              required
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Auto-saving draft</p>
              </div>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-primary text-sm font-semibold"
                  >
                    <CheckCircle size={16} />
                    Logged
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    type="submit"
                    className="btn-primary px-8"
                  >
                    <Send size={14} />
                    Submit Log
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyWorkspace;
