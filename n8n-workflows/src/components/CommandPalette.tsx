'use client';

import { useState, useEffect, useRef } from 'react';
import { Command, Search, FileSearch, Filter, BarChart3, Zap, Calendar, Settings, Download, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

// Hook to detect operating system
function useOS() {
  const [os, setOS] = useState<'mac' | 'windows' | 'linux' | 'unknown'>('unknown');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('mac')) {
        setOS('mac');
      } else if (userAgent.includes('win')) {
        setOS('windows');
      } else if (userAgent.includes('linux')) {
        setOS('linux');
      }
    }
  }, []);
  
  return os;
}

export function CommandPalette({ isOpen, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const os = useOS();
  
  // Determine modifier key based on OS
  const modKey = os === 'mac' ? '⌘' : 'Ctrl';
  const modKeyDisplay = os === 'mac' ? '⌘' : 'Ctrl';
  
  // Get recent workflows for quick access
  const { data: recentWorkflows } = trpc.workflows.getAll({ page: 1, limit: 10 });
  
  // Define command items
  const commands: CommandItem[] = [
    {
      id: 'search-workflows',
      title: 'Search Workflows',
      description: 'Search through all workflows by name, description, or integration',
      icon: <Search size={18} />,
      action: () => {
        onAction('search');
        onClose();
      },
      keywords: ['search', 'find', 'workflows', 'lookup']
    },
    {
      id: 'filter-active',
      title: 'Show Active Workflows',
      description: 'Filter to show only active workflows',
      icon: <Filter size={18} />,
      action: () => {
        onAction('filter', { activeOnly: true });
        onClose();
      },
      keywords: ['filter', 'active', 'enabled']
    },
    {
      id: 'filter-webhook',
      title: 'Webhook Workflows',
      description: 'Show workflows triggered by webhooks',
      icon: <Zap size={18} />,
      action: () => {
        onAction('filter', { triggerType: 'webhook' });
        onClose();
      },
      keywords: ['webhook', 'trigger', 'http']
    },
    {
      id: 'filter-scheduled',
      title: 'Scheduled Workflows',
      description: 'Show workflows with scheduled triggers',
      icon: <Calendar size={18} />,
      action: () => {
        onAction('filter', { triggerType: 'scheduled' });
        onClose();
      },
      keywords: ['scheduled', 'cron', 'timer', 'interval']
    },
    {
      id: 'view-stats',
      title: 'View Statistics',
      description: 'Show dashboard with workflow statistics',
      icon: <BarChart3 size={18} />,
      action: () => {
        onAction('stats');
        onClose();
      },
      keywords: ['stats', 'statistics', 'dashboard', 'analytics']
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <Settings size={18} />,
      action: () => {
        onAction('theme');
        onClose();
      },
      keywords: ['theme', 'dark', 'light', 'mode']
    }
  ];
  
  // Add recent workflows as commands
  const workflowCommands: CommandItem[] = (recentWorkflows || []).slice(0, 5).map((workflow: any) => ({
    id: `workflow-${workflow.id}`,
    title: workflow.name || 'Untitled Workflow',
    description: `Open ${workflow.filename}`,
    icon: <FileSearch size={18} />,
    action: () => {
      onAction('open-workflow', workflow);
      onClose();
    },
    keywords: [workflow.name || '', workflow.filename, ...(workflow.integrations || [])]
  }));
  
  // Combine all commands
  const allCommands = [...commands, ...workflowCommands];
  
  // Filter commands based on query
  const filteredCommands = query.trim() 
    ? allCommands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      )
    : allCommands;
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative">
          <Command className="absolute left-4 top-4 text-slate-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500"
          />
        </div>
        
        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto border-t border-slate-200 dark:border-slate-700">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="mx-auto mb-4" size={32} />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try searching for "search", "filter", or "stats"</p>
            </div>
          ) : (
            <div className="p-2">
              {query.trim() === '' && (
                <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Quick Actions
                </div>
              )}
              {filteredCommands.slice(0, 8).map((command, index) => (
                <button
                  key={command.id}
                  onClick={command.action}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className={`shrink-0 ${
                    index === selectedIndex
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {command.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{command.title}</div>
                    <div className={`text-sm truncate ${
                      index === selectedIndex
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {command.description}
                    </div>
                  </div>
                  {command.id.startsWith('workflow-') && (
                    <div className="flex gap-1">
                      <ExternalLink size={14} className="text-slate-400" />
                    </div>
                  )}
                </button>
              ))}
              {recentWorkflows && recentWorkflows.length > 5 && (
                <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  Showing 5 of {recentWorkflows.length} recent workflows
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">esc</kbd>
                Close
              </span>
            </div>
            <div>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">{modKeyDisplay}K</kbd> to open</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing command palette state with OS detection
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const os = useOS();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K on Mac or Ctrl+K on Windows/Linux
      const isModKey = os === 'mac' ? e.metaKey : e.ctrlKey;
      
      if (isModKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [os]);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
} 