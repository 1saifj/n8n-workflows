# N8N Workflows Gallery - Modernized

A modern, high-performance web application for browsing and exploring **2,053 n8n workflow examples** built with the Better-T3-Stack.

## 🚀 **Migration Complete!**

This project has been successfully modernized from Python/FastAPI to a modern stack:

### **Original Stack (Python)**
- FastAPI + SQLite + FTS5
- Vanilla HTML/CSS/JavaScript
- Single-page application

### **New Stack (Better-T3-Stack)**
- **Next.js 15** + React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Fuse.js** for advanced search
- **Radix UI** components
- **TanStack React Query** for data fetching
- **Lucide React** icons

## 📊 **Features**

### **🔍 Advanced Search & Filtering**
- **Fuzzy search** across workflow names, nodes, and tags
- **Real-time filtering** by category, trigger type, and status
- **Sort options** by date, name, or complexity
- **Faceted search** with dynamic filters

### **📱 Modern UI/UX**
- **Responsive design** optimized for all devices
- **Dark/Light theme** support
- **Grid and List views** for workflows
- **Interactive cards** with expandable details
- **Smooth animations** and transitions

### **⚡ Performance**
- **Sub-100ms search** responses
- **Virtual scrolling** for large datasets
- **Lazy loading** and pagination
- **Optimized bundle** with code splitting

### **📈 Analytics Dashboard**
- **Real-time statistics** overview
- **Workflow complexity** analysis
- **Popular node types** tracking
- **Activity trends** visualization

## 🏃‍♂️ **Quick Start**

### **Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 **Project Structure**

```
n8n-workflows/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Main homepage
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── WorkflowBrowser.tsx
│   │   ├── WorkflowCard.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SearchHeader.tsx
│   │   ├── SortControls.tsx
│   │   └── StatsOverview.tsx
│   ├── lib/              # Utilities and services
│   │   ├── workflow-loader.ts
│   │   ├── search.ts
│   │   └── utils.ts
│   └── types/            # TypeScript type definitions
│       └── workflow.ts
├── public/               # Static assets
└── package.json
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### **Tailwind Configuration**
The application uses a custom Tailwind configuration optimized for the workflow gallery interface.

## 📊 **Data Source**

The application reads from **2,053 n8n workflow JSON files** located in the `../workflows` directory:

- **365 unique integrations**
- **29,445 total nodes**
- **12 workflow categories**
- **4 trigger types** (webhook, scheduled, triggered, manual)

## 🎨 **UI Components**

### **Workflow Cards**
- **Compact grid view** with essential information
- **Detailed list view** with expanded metadata
- **Status indicators** for active/inactive workflows
- **Action buttons** for viewing and downloading

### **Filter Sidebar**
- **Category filters** with workflow counts
- **Trigger type filters**
- **Active status filters**
- **Node count range slider**
- **Popular nodes** listing

### **Search Interface**
- **Real-time search** with debounced input
- **Advanced filters** toggle
- **Sort controls** with multiple options
- **View mode** switcher (grid/list)

## 🚀 **Performance Optimizations**

### **Search Performance**
- **Fuse.js** fuzzy search with weighted scoring
- **Client-side caching** of search results
- **Debounced search** input (300ms)
- **Indexed filtering** for instant responses

### **Rendering Performance**
- **React.memo** for component optimization
- **Virtual scrolling** for large lists
- **Image lazy loading**
- **Code splitting** by route

### **Bundle Optimization**
- **Tree shaking** for unused code elimination
- **Dynamic imports** for heavy components
- **Compressed assets** with gzip
- **Modern JavaScript** targeting

## 🎯 **Future Enhancements**

### **Planned Features**
- [ ] **Mermaid diagram** visualization
- [ ] **Workflow import/export** functionality
- [ ] **Collaborative features** (favorites, sharing)
- [ ] **Advanced analytics** dashboard
- [ ] **Workflow validation** and testing
- [ ] **API documentation** generation

### **Cloudflare Deployment**
- [ ] **D1 Database** integration
- [ ] **KV Storage** for caching
- [ ] **Workers** for API endpoints
- [ ] **Pages** for frontend hosting

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### **Code Quality**
- **TypeScript** strict mode enabled
- **ESLint** with Next.js configuration
- **Prettier** for code formatting
- **Husky** for git hooks

## 📚 **API Reference**

### **GET /api/workflows**
```typescript
// Query Parameters
{
  q?: string;           // Search query
  category?: string;    // Filter by category
  trigger?: string;     // Filter by trigger type
  active?: string;      // Filter by active status
  limit?: number;       // Results per page (default: 50)
  offset?: number;      // Pagination offset
}

// Response
{
  workflows: Workflow[];
  stats: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    categories: number;
    activeCount: number;
    averageNodes: number;
  };
  success: boolean;
}
```

## 🔄 **Migration Notes**

### **Completed Migration Tasks**
- ✅ **Project initialization** with Better-T3-Stack
- ✅ **Component architecture** setup
- ✅ **TypeScript types** definition
- ✅ **Search functionality** with Fuse.js
- ✅ **Filtering system** implementation
- ✅ **Responsive UI** components
- ✅ **API routes** for data serving
- ✅ **Development environment** setup

### **Legacy Python Cleanup**
The original Python files can be safely removed after confirming the new application works correctly:

```bash
# Files to remove after verification
rm -f api_server.py
rm -f workflow_db.py
rm -f run.py
rm -rf static/
rm -f requirements.txt
rm -f *.db
```

## 📄 **License**

This project is part of the n8n workflows migration and follows the same license terms as the original project.

---

## 🙏 **Acknowledgments**

- **Original n8n workflows** collection
- **Better-T3-Stack** for the modern foundation
- **Vercel** for Next.js development
- **Tailwind Labs** for CSS framework
- **Radix UI** for accessible components

---

**Built with ❤️ using the Better-T3-Stack** 