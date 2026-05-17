import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          © 2024 AI Resume Auditor — Powered by Anthropic Claude
        </footer>
      </div>
    </div>
  );
}
