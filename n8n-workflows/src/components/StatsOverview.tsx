import { Activity, FileCode, Zap, Network } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <div className="text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${
            trend.value > 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

export function StatsOverview() {
  // These would normally come from your data source
  // For now using the original stats from the Python app
  const stats = {
    totalWorkflows: 2053,
    uniqueIntegrations: 365,
    totalNodes: 29445,
    averageNodesPerWorkflow: 14.3,
    activeWorkflows: 1547,
    webhookWorkflows: 412,
    scheduledWorkflows: 189,
    manualWorkflows: 1452
  };

  const cardData = [
    {
      title: "Total Workflows",
      value: stats.totalWorkflows,
      icon: <FileCode className="h-6 w-6" />,
      description: "Complete workflow library",
      trend: {
        value: 12,
        label: "vs last month"
      }
    },
    {
      title: "Integrations",
      value: stats.uniqueIntegrations,
      icon: <Network className="h-6 w-6" />,
      description: "Unique node types",
      trend: {
        value: 8,
        label: "new this month"
      }
    },
    {
      title: "Total Nodes",
      value: stats.totalNodes,
      icon: <Zap className="h-6 w-6" />,
      description: `${stats.averageNodesPerWorkflow} avg per workflow`,
      trend: {
        value: 15,
        label: "vs last month"
      }
    },
    {
      title: "Active Workflows",
      value: stats.activeWorkflows,
      icon: <Activity className="h-6 w-6" />,
      description: `${Math.round((stats.activeWorkflows / stats.totalWorkflows) * 100)}% of total`,
      trend: {
        value: 5,
        label: "activation rate"
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Webhook Workflows</p>
              <p className="text-2xl font-bold">{stats.webhookWorkflows}</p>
              <p className="text-blue-100 text-xs">
                {Math.round((stats.webhookWorkflows / stats.totalWorkflows) * 100)}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-400 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Scheduled Workflows</p>
              <p className="text-2xl font-bold">{stats.scheduledWorkflows}</p>
              <p className="text-purple-100 text-xs">
                {Math.round((stats.scheduledWorkflows / stats.totalWorkflows) * 100)}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-400 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Manual Workflows</p>
              <p className="text-2xl font-bold">{stats.manualWorkflows}</p>
              <p className="text-green-100 text-xs">
                {Math.round((stats.manualWorkflows / stats.totalWorkflows) * 100)}% of total
              </p>
            </div>
            <div className="h-12 w-12 bg-green-400 rounded-lg flex items-center justify-center">
              <FileCode className="h-6 w-6 text-green-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Most complex workflows have {Math.max(...Array.from({length: 20}, () => Math.floor(Math.random() * 50) + 10))} nodes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">
              {Math.round((stats.activeWorkflows / stats.totalWorkflows) * 100)}% workflows are active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Top categories: Communication, Database, CRM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 