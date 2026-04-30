import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, CheckCircle, ShieldCheck, AlertCircle, Calendar, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const InternPortal = () => {
  const { user } = useAuth();
  const [checkedIn, setCheckedIn] = useState(false);
  const [logText, setLogText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    logs_submitted: 0,
    performance_score: '90%',
    days_present: 0,
    pending_reviews: 0
  });

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [attendanceRes, worklogsRes] = await Promise.all([
          api.get('/attendance/history'),
          api.get('/worklogs/history')
        ]);

        // Check if checked in today
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceRes.data.find(r => r.date === today);
        if (todayRecord && !todayRecord.clock_out) {
          setCheckedIn(todayRecord.id); // Store ID for checkout
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
        const res = await api.post('/attendance/check-in');
        setCheckedIn(res.data.id);
        setStats(prev => ({ ...prev, days_present: prev.days_present + 1 }));
      } else {
        await api.post('/attendance/check-out');
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
          <p className="label mb-1.5">Operative Console</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Welcome, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="badge-green py-1.5">
          <ShieldCheck size={13} />
          Green Zone Active
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Attendance Card */}
        <div className="card p-7 flex flex-col items-center justify-center text-center gap-5">
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
            checkedIn
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.12)]'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-500'
          }`}>
            <Clock size={36} />
          </div>
          <div>
            <h3 className="text-base font-heading font-semibold text-white mb-1">
              {checkedIn ? 'Shift Active' : 'Not Checked In'}
            </h3>
            <p className="text-xs text-zinc-500">Working hours: 09:00 – 18:00 IST</p>
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

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-5">
          {[
            { label: 'Logs Submitted', value: stats.logs_submitted, icon: FileText, color: 'text-accent' },
            { label: 'Efficiency Score', value: stats.performance_score, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Days Present', value: stats.days_present, icon: Calendar, color: 'text-blue-400' },
            { label: 'Pending Reviews', value: stats.pending_reviews, icon: AlertCircle, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card flex flex-col">
              <div className={`mb-4 ${color}`}><Icon size={18} /></div>
              <p className="label mb-1">{label}</p>
              <p className="text-2xl font-heading font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance + Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Details */}
        <div className="card p-7">
          <h2 className="text-sm font-heading font-semibold text-white mb-5">Performance Status</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex gap-3">
              <ShieldCheck size={17} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium mb-0.5">Studio Status: Healthy</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Your output is consistent with studio standards. Keep it up!</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
              <AlertCircle size={17} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium mb-0.5">End of Day</p>
                <p className="text-xs text-zinc-400 leading-relaxed">Remember to submit your log before checking out to ensure your work is recorded.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Log */}
        <div className="xl:col-span-2 card p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-heading font-semibold text-white">Daily Work Log</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Describe your contributions for today</p>
            </div>
            <span className="label">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
          <form onSubmit={submitLog} className="space-y-5">
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="What did you work on today? Include tasks completed, blockers, and your plan for tomorrow..."
              className="input resize-none h-36 leading-relaxed"
              required
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-700 uppercase tracking-widest">End-to-end encrypted</p>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm font-semibold"
                  >
                    <CheckCircle size={18} />
                    Log submitted!
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    type="submit"
                    className="btn-primary px-7"
                  >
                    <Send size={15} />
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

export default InternPortal;
