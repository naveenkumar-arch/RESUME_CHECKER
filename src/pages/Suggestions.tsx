import { useResume } from '../context/ResumeContext';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function Suggestions() {
  const { analysis } = useResume();
  if (!analysis) return <div className="text-gray-400 text-center py-20">No data — upload a resume first.</div>;
  const d = analysis;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Suggestions & Improvements</h1><p className="text-sm text-gray-500 mt-1">AI-generated actionable feedback from Claude.</p></div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h2 className="font-semibold text-gray-800 mb-2">Grade Reasoning</h2><p className="text-sm text-gray-600 leading-relaxed">{d.grade_reasoning}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: '✅ Strengths', items: d.strengths, icon: CheckCircle2, bg: 'bg-green-50 border-green-100', ic: 'text-green-500' },
          { title: '⚠️ Improvements', items: d.improvements, icon: AlertTriangle, bg: 'bg-amber-50 border-amber-100', ic: 'text-amber-500' },
          { title: '💡 Quick Wins', items: d.quick_suggestions, icon: Lightbulb, bg: 'bg-purple-50 border-purple-100', ic: 'text-purple-500' },
        ].map(({ title, items, icon: Icon, bg, ic }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
            <ul className="space-y-3">{items.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ic}`} />
                <p className="text-sm text-gray-700">{item}</p>
              </li>
            ))}</ul>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { l: 'Detected Sections', val: d.detected_sections },
          { l: 'Missing Sections', val: d.missing_sections },
        ].map(({ l, val }) => (
          <div key={l} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">{l}</h3>
            <div className="flex flex-wrap gap-2">{val.length ? val.map(s => <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">{s}</span>) : <p className="text-xs text-gray-400">None found</p>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
