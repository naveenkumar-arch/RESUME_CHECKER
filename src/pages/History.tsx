import { useResume } from '../context/ResumeContext';
import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import { clsx } from 'clsx';

function gradeStyle(g: string) {
  if (['A+','A'].includes(g)) return 'bg-green-100 text-green-700';
  if (['B+','B'].includes(g)) return 'bg-blue-100 text-blue-700';
  if (['C+','C'].includes(g)) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function History() {
  const { history } = useResume();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Analysis History</h1><p className="text-sm text-gray-500 mt-1">Last 5 resumes analyzed (stored locally).</p></div>
      {history.length === 0
        ? <div className="text-center py-20 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No history yet. Analyze a resume to get started.</p></div>
        : <div className="space-y-4">{history.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-5 hover:border-purple-200 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-purple-600" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.fileName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {item.analyzedAt}</p>
              {item.jobTitle && <p className="text-xs text-gray-400">{item.jobTitle}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center"><p className="text-xs text-gray-400">ATS</p><p className={clsx('text-lg font-extrabold', item.atsScore >= 75 ? 'text-green-600' : item.atsScore >= 50 ? 'text-amber-500' : 'text-red-500')}>{item.atsScore}</p></div>
              <span className={clsx('px-2.5 py-1 rounded-lg text-sm font-bold', gradeStyle(item.grade))}>{item.grade}</span>
              <Link to="/dashboard" className="text-sm text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50">View</Link>
            </div>
          </div>
        ))}</div>
      }
    </div>
  );
}
