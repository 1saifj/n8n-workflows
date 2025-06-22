import { Suspense } from 'react'; 
import { StatsOverview } from '@/components/StatsOverview';
import { SearchHeader } from '@/components/SearchHeader';
import { WorkflowBrowser } from '@/components/WorkflowBrowser';

export const metadata = {
  title: 'N8N Workflows Gallery',
  description: 'Browse and explore 2,053 n8n workflow examples with advanced search and filtering',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                N8N Workflows Gallery
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Discover and explore 2,053 real-world n8n automation workflows
              </p>
            </div>
            
            {/* Search */}
            <SearchHeader />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          }>
            <StatsOverview />
          </Suspense>

          {/* Workflow Browser */}
          <Suspense fallback={
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-64 h-96 bg-white dark:bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <WorkflowBrowser />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>
              Built with{' '}
              <a href="https://nextjs.org" className="text-blue-600 hover:text-blue-700 transition-colors">
                Next.js
              </a>
              {' '}and{' '}
              <a href="https://tailwindcss.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                Tailwind CSS
              </a>
              {' '}•{' '}
              <a href="https://github.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                View Source
              </a>
            </p>
          </div>
      </div>
      </footer>
    </div>
  );
}
