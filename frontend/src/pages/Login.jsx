import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, Mail, Lock, AlertCircle, User, Briefcase, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('core_team');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let result;
    if (mode === 'login') {
      result = await login(email, password);
    } else {
      result = await register({ name, email, password, role });
    }

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent/3 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Terminal size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight mb-2">
            Elyndor Management
          </h1>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' ? 'Resource & team orchestration platform' : 'Join the Elyndor production ecosystem'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Mode Toggle */}
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'register' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Join Studio
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={mode === 'register'}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                        placeholder="Arjun Mehta"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Your Role</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
                      >
                        <option value="intern">Intern / Associate</option>
                        <option value="core_team">Core Team Member</option>
                        <option value="admin">System Administrator</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                    placeholder="name@elyndor.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Authenticate Access' : 'Create Profile'}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/[0.06]">
            <p className="text-center text-zinc-600 text-xs">
              {mode === 'login' 
                ? 'Forgotten your credentials? ' 
                : 'Already have an account? '}
              <span 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary/80 hover:text-primary cursor-pointer transition-colors"
              >
                {mode === 'login' ? 'Contact IT Support' : 'Sign in here'}
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-[10px] uppercase tracking-[0.2em] mt-8">
          Elyndor Interactive © 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
