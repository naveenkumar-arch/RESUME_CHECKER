import { useResume } from '../context/ResumeContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function KeywordAnalysis() {
  const { analysis } = useResume();
  if (!analysis) return <div className="text-gray-400 text-center py-20">No data — upload a resume first.</div>;
  const d = analysis;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Keyword Analysis</h1><p className="text-sm text-gray-500 mt-1">Real keywords extracted and evaluated by Claude AI.</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[{ l: 'Present', n: d.keywords.present.length, c: 'bg-green-50 text-green-700 border-green-200' }, { l: 'Missing', n: d.keywords.missing.length, c: 'bg-red-50 text-red-700 border-red-200' }, { l: 'Total Expected', n: d.keywords.total_expected, c: 'bg-blue-50 text-blue-700 border-blue-200' }].map(s => (
          <div key={s.l} className={`p-5 rounded-xl border text-center ${s.c}`}><p className="text-3xl font-extrabold">{s.n}</p><p className="text-sm font-medium mt-1">{s.l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Present Keywords</h2>
          <div className="flex flex-wrap gap-2">{d.keywords.present.map(k => <span key={k} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200">{k}</span>)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Missing Keywords</h2>
          <div className="flex flex-wrap gap-2">{d.keywords.missing.map(k => <span key={k} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200">{k}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
