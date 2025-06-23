'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
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

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const os = useOS();
  
  // Determine modifier key based on OS
  const modKey = os === 'mac' ? '⌘' : 'Ctrl';
  
  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: [modKey, 'K'], description: 'Open command palette', category: 'Navigation' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Navigation' },
    { keys: ['Esc'], description: 'Close modals/overlays', category: 'Navigation' },
    
    // Search & Filters
    { keys: [modKey, 'F'], description: 'Focus search bar', category: 'Search' },
    { keys: [modKey, 'Shift', 'F'], description: 'Toggle filters', category: 'Search' },
    { keys: [modKey, 'Shift', 'C'], description: 'Clear search', category: 'Search' },
    
    // Views
    { keys: [modKey, 'D'], description: 'Go to dashboard', category: 'Views' },
    { keys: [modKey, 'B'], description: 'Browse workflows', category: 'Views' },
    { keys: [modKey, 'S'], description: 'View statistics', category: 'Views' },
    
    // Actions
    { keys: [modKey, 'Enter'], description: 'Open selected workflow', category: 'Actions' },
    { keys: [modKey, 'Shift', 'D'], description: 'Download workflow', category: 'Actions' },
    { keys: [modKey, 'T'], description: 'Toggle theme', category: 'Actions' },
  ];

  if (!isOpen) return null;
  
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Keyboard className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                  {category}
                </h3>
                <div className="space-y-3">
                  {shortcuts
                    .filter(shortcut => shortcut.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="text-slate-900 dark:text-slate-100">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <div key={keyIndex} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm min-w-[2rem] text-center">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-slate-400 text-xs">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use the command palette ({modKey}K) for quick access to any action</li>
              <li>• Search supports fuzzy matching - try partial words</li>
              <li>• Hold Shift while clicking to select multiple items</li>
              <li>• Press ? anywhere to show these shortcuts</li>
              {os !== 'mac' && (
                <li>• On Windows/Linux, use Ctrl instead of Cmd (⌘)</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
} 