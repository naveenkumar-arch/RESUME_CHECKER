import { useResume } from '../context/ResumeContext';
import { Download, Moon, Sun, CheckCircle2 } from 'lucide-react';

export default function Header() {
  const { fileName, analyzedAt, darkMode, toggleDarkMode, addToast } = useResume();
  const handleDownload = () => { window.print(); addToast('Report sent to print / PDF', 'info'); };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{fileName || 'No resume uploaded'}</p>
          <p className="text-xs text-gray-400">{analyzedAt ? `Analyzed ${analyzedAt}` : 'Upload a resume to begin'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>
    </header>
  );
}
