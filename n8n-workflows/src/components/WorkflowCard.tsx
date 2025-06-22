import { useState } from 'react';
import { Calendar, Users, Play, Pause, Download, Eye, ChevronRight, Zap, Clock } from 'lucide-react';
import { cn, formatRelativeTime, truncateText } from '@/lib/utils';
import type { Workflow } from '@/types/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
  viewMode: 'grid' | 'list';
}

export function WorkflowCard({ workflow, viewMode }: WorkflowCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTriggerIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.includes('webhook')) return <Zap className="h-4 w-4" />;
    if (lower.includes('scheduled') || lower.includes('cron')) return <Clock className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  const getCategoryColor = (tags: string[] = []) => {
    const category = tags[0] || 'Other';
    const colors: Record<string, string> = {
      'Communication': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Database': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CRM': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Analytics': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Social Media': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Productivity': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Status Indicator */}
            <div className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              workflow.active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
            )} />

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {workflow.name}
                </h3>
                {workflow.tags?.slice(0, 2).map((tag, i) => (
                  <span 
                    key={i}
                    className={cn("px-2 py-0.5 text-xs rounded-full", getCategoryColor(workflow.tags))}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {workflow.nodes.length} nodes
                </span>
                <span className="flex items-center gap-1">
                  {getTriggerIcon(workflow.filename)}
                  {workflow.triggerCount} triggers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(new Date(workflow.updatedAt))}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Download JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Toggle details"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                showDetails && "rotate-90"
              )} />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Filename:</span>
                <p className="font-mono text-xs truncate">{workflow.filename}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Created:</span>
                <p>{formatRelativeTime(new Date(workflow.createdAt))}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <p className={workflow.active ? "text-green-600" : "text-slate-500"}>
                  {workflow.active ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Complexity:</span>
                <p>{workflow.nodes.length < 10 ? "Simple" : workflow.nodes.length < 20 ? "Medium" : "Complex"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              workflow.active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
            )} />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {workflow.name}
            </h3>
          </div>
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {workflow.tags.slice(0, 2).map((tag, i) => (
                <span 
                  key={i}
                  className={cn("px-2 py-0.5 text-xs rounded-full", getCategoryColor(workflow.tags))}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          <button
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="View workflow"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Download JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Nodes
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {workflow.nodes.length}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {getTriggerIcon(workflow.filename)}
            Triggers
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {workflow.triggerCount}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {formatRelativeTime(new Date(workflow.updatedAt))}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
          {workflow.filename}
        </div>
      </div>
    </div>
  );
} 