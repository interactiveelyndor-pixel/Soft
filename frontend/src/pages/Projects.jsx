import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Code, Plus, ArrowUpRight, X, Trash2 } from 'lucide-react';
import api from '../services/api';

const statusColorMapping = {
  active: 'badge-green',
  completed: 'bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
  on_hold: 'bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
  cancelled: 'badge-muted',
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    project_type: 'Game',
    engine: 'Unreal Engine 5',
    status: 'active',
    progress: 0
  });

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/', newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', project_type: 'Game', engine: 'Unreal Engine 5', status: 'active', progress: 0 });
      fetchProjects();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      alert('Failed to delete project');
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
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Studio Production</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Projects</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card card-hover p-7 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 group-hover:text-accent group-hover:border-accent/20 transition-all">
                {p.project_type?.toLowerCase().includes('internal') ? <Code size={20} /> : <Gamepad2 size={20} />}
              </div>
              <div className="flex gap-2 items-center">
                <div className={statusColorMapping[p.status] || 'badge-muted'}>{p.status.replace('_', ' ')}</div>
                <button 
                  onClick={(e) => handleDelete(p.id, e)}
                  className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mb-5 relative">
              <h3 className="text-xl font-heading font-semibold text-white mb-1 group-hover:text-accent transition-colors leading-tight">{p.name}</h3>
              <p className="text-xs text-zinc-500">{p.project_type || 'Project'} · {p.engine || 'Custom Engine'}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6 relative">
              {['Active', p.engine].filter(Boolean).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-500 border border-white/[0.06]">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-2.5 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{p.team_size || 0} members</span>
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(p.team_size || 0, 4) }).map((_, j) => (
                      <div key={j} className="w-5 h-5 rounded-full bg-zinc-700 border border-[#0c0c0e] text-[9px] text-zinc-400 flex items-center justify-center" />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-400">{Math.round(p.progress)}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="absolute bottom-7 right-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={18} className="text-accent" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-white">Initialize New Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Project Name</label>
                    <input
                      type="text"
                      required
                      value={newProject.name}
                      onChange={e => setNewProject({...newProject, name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. Kaali: A Mother's Tale"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Type</label>
                      <select 
                        value={newProject.project_type}
                        onChange={e => setNewProject({...newProject, project_type: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all appearance-none"
                      >
                        <option value="Game">Game</option>
                        <option value="Software">Software</option>
                        <option value="Internal Tool">Internal Tool</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Engine / Stack</label>
                      <input
                        type="text"
                        value={newProject.engine}
                        onChange={e => setNewProject({...newProject, engine: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all"
                        placeholder="e.g. Unreal Engine 5"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-3.5 font-semibold">
                    Confirm Production Start
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
