import { useResume } from '../context/ResumeContext';
import { FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function ResumeAnalysis() {
  const { analysis, fileName, analyzedAt } = useResume();
  if (!analysis) return <div className="text-gray-400 text-center py-20">No data — upload a resume first.</div>;
  const d = analysis;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1><p className="text-sm text-gray-500">{fileName} · {analyzedAt}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-2">Grade Reasoning</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{d.grade_reasoning}</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[
          { label: 'Experience', val: d.experience_years !== null ? `${d.experience_years} years detected` : 'Not detected', color: 'border-l-4 border-blue-400' },
          { label: 'Contact Info', val: d.contact_info_present ? 'Present ✅' : 'Missing ❌ — Add name, email, phone', color: 'border-l-4 border-green-400' },
          { label: 'Professional Summary', val: d.summary_present ? 'Present ✅' : 'Missing ❌ — Add a summary section', color: 'border-l-4 border-purple-400' },
          { label: 'Education', val: d.education_present ? 'Present ✅' : 'Missing ❌ — Add education details', color: 'border-l-4 border-amber-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className={clsx('bg-white rounded-xl border border-gray-200 p-5 shadow-sm pl-5', color)}>
            <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
            <p className="text-sm text-gray-600">{val}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Detected Sections</h2>
          <div className="flex flex-wrap gap-2">{d.detected_sections.map(s => <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">{s}</span>)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Strengths</h2>
          <ul className="space-y-2">{d.strengths.map((s, i) => <li key={i} className="flex gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
