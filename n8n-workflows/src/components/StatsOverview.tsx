'use client';

import { trpc } from '@/lib/trpc';
import { TrendingUp, Activity, Zap, Layers } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
}) => (
  <div className="relative overflow-hidden rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-700/40"></div>
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">{trend}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
          <Icon size={24} />
        </div>
      </div>
    </div>
  </div>
);

const TriggerDistribution = ({ triggers }: { triggers: Record<string, number> }) => (
  <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-700/40"></div>
    <div className="relative">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Zap size={20} className="text-blue-500" />
        Trigger Types
      </h3>
      <div className="space-y-3">
        {Object.entries(triggers).map(([type, count]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="capitalize text-slate-600 dark:text-slate-400">{type}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  style={{ width: `${(count / Math.max(...Object.values(triggers))) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[2rem] text-right">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ComplexityDistribution = ({ complexity }: { complexity: Record<string, number> }) => (
  <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-700/40"></div>
    <div className="relative">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Layers size={20} className="text-purple-500" />
        Complexity Levels
      </h3>
      <div className="space-y-3">
        {Object.entries(complexity).map(([level, count]) => (
          <div key={level} className="flex items-center justify-between">
            <span className="capitalize text-slate-600 dark:text-slate-400">{level}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                  style={{ width: `${(count / Math.max(...Object.values(complexity))) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[2rem] text-right">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export function StatsOverview() {
  const { data: stats, isLoading, error } = trpc.workflows.getStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-600 dark:text-red-400">Failed to load statistics</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Activity}
          label="Total Workflows"
          value={stats.total}
        />
        <StatCard 
          icon={TrendingUp}
          label="Active"
          value={stats.active}
          trend={`${Math.round((stats.active / stats.total) * 100)}% active`}
        />
        <StatCard 
          icon={Layers}
          label="Total Nodes"
          value={stats.totalNodes}
        />
        <StatCard 
          icon={Zap}
          label="Integrations"
          value={stats.uniqueIntegrations}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <TriggerDistribution triggers={stats.triggers} />
        <ComplexityDistribution complexity={stats.complexity} />
      </div>
    </div>
  );
} 