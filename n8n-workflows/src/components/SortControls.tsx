import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'name' | 'updated' | 'nodes' | 'created';

interface SortControlsProps {
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  onSortChange: (option: SortOption) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
  className?: string;
}

export function SortControls({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderChange,
  className
}: SortControlsProps) {
  const sortOptions = [
    { value: 'updated' as const, label: 'Last Updated' },
    { value: 'name' as const, label: 'Name' },
    { value: 'created' as const, label: 'Created' },
    { value: 'nodes' as const, label: 'Node Count' }
  ];

  const handleSortOptionClick = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle order if same option is selected
      onOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort option and default to desc for most options, asc for name
      onSortChange(option);
      onOrderChange(option === 'name' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
      : <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        Sort by:
      </span>
      
      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {sortOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleSortOptionClick(option.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5",
              "hover:bg-slate-50 dark:hover:bg-slate-700",
              sortBy === option.value
                ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                : "text-slate-600 dark:text-slate-400",
              index > 0 && "border-l border-slate-200 dark:border-slate-700"
            )}
            title={`Sort by ${option.label.toLowerCase()} ${
              sortBy === option.value 
                ? `(${sortOrder === 'asc' ? 'ascending' : 'descending'})`
                : ''
            }`}
          >
            <span>{option.label}</span>
            {getSortIcon(option.value)}
          </button>
        ))}
      </div>
    </div>
  );
} 