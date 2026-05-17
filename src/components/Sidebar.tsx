import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Key, Target, Lightbulb, BarChart2, History, Upload } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard',        path: '/dashboard',  icon: LayoutDashboard },
  { name: 'Resume Analysis',  path: '/analysis',   icon: FileText },
  { name: 'Keyword Analysis', path: '/keywords',   icon: Key },
  { name: 'Skill Gap',        path: '/skills',     icon: Target },
  { name: 'Suggestions',      path: '/suggestions',icon: Lightbulb },
  { name: 'Reports',          path: '/reports',    icon: BarChart2 },
  { name: 'History',          path: '/history',    icon: History },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col w-60 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold text-gray-900">AI Resume Auditor</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-4 h-4', isActive ? 'text-[#7C3AED]' : 'text-gray-400')} />
                {name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-700 mb-0.5">Analyze Another Resume</p>
          <p className="text-xs text-gray-400 mb-3">Upload a new resume to get started</p>
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
            <Upload className="w-4 h-4" /> Upload Resume
          </Link>
        </div>
      </div>
    </div>
  );
}
