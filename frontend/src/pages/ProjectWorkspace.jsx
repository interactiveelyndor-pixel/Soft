import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Settings, Users, MessageSquare, Clock, Code } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/`);
        // Filter out the specific project (since backend doesn't have a GET /projects/:id endpoint yet)
        const found = response.data.find(p => p.id.toString() === id);
        if (found) {
          setProject(found);
        } else {
          toast.error("Project not found");
          navigate('/projects');
        }
      } catch (error) {
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{project.name}</h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{project.project_type || 'Game'} · {project.engine || 'Custom Engine'}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => toast("Opening source control...")} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <Code size={14} /> Repository
          </button>
          <button onClick={() => toast("Compiling build...")} className="btn-primary py-2.5 px-5 text-xs font-semibold">
            <Play size={14} className="fill-current" /> Build Run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="xl:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="card p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
            <h2 className="text-sm font-heading font-semibold text-white mb-6">Production Status</h2>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[2.5rem] font-heading font-semibold text-white leading-none mb-2">{project.progress}%</p>
                <p className="text-xs text-zinc-400">Overall Completion</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white mb-1">Alpha Milestone</p>
                <p className="text-xs text-zinc-500">Due in 14 days</p>
              </div>
            </div>
            <div className="h-3 bg-[#0a0a0c] rounded-full overflow-hidden border border-white/[0.05]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary/80 to-accent rounded-full"
              />
            </div>
          </div>

          {/* Activity Mock */}
          <div className="card p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-heading font-semibold text-white">Recent Commits & Activity</h2>
              <button className="text-xs text-zinc-500 hover:text-accent transition-colors">View All</button>
            </div>
            <div className="space-y-5">
              {[
                { user: 'Arjun', action: 'merged PR #142', target: 'core-gameplay-loop', time: '2 hours ago', icon: Code },
                { user: 'Sarah', action: 'uploaded asset', target: 'hero_character_v2.fbx', time: '5 hours ago', icon: Clock },
                { user: 'System', action: 'automated build', target: 'failed (physics_bug)', time: 'Yesterday', icon: Settings },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-500 flex-shrink-0 group-hover:text-accent group-hover:border-accent/20 transition-all">
                    <activity.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-white/[0.04] pb-5">
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-white">{activity.user}</span> {activity.action} <span className="text-accent">{activity.target}</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Team */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-zinc-500" />
                <h2 className="text-sm font-heading font-semibold text-white">Assigned Team</h2>
              </div>
              <span className="badge-muted">{project.team_size || 0} Members</span>
            </div>
            <div className="space-y-3">
              {Array.from({ length: Math.max(1, Math.min(project.team_size || 0, 5)) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {['A', 'S', 'D', 'M', 'R'][i % 5]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Operative {i + 1}</p>
                    <p className="text-[10px] text-zinc-500">Developer</p>
                  </div>
                  <button onClick={() => toast("Opening chat...")} className="ml-auto p-2 text-zinc-500 hover:text-white transition-colors">
                    <MessageSquare size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => toast("Manage team functionality coming soon")} className="btn-ghost w-full mt-4 py-2.5 text-xs">Manage Team</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
