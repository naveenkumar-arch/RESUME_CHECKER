import { useResume } from '../context/ResumeContext';
import { CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Reports() {
  const { analysis, fileName, analyzedAt } = useResume();
  if (!analysis) return <div className="text-gray-400 text-center py-20">No data — upload a resume first.</div>;
  const d = analysis;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Resume Report</h1><p className="text-sm text-gray-500 mt-1">{fileName} · {analyzedAt}</p></div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">Print / Download PDF</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'ATS Score', v: `${d.ats_score}/100`, c: d.ats_score >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200' },
          { l: 'Job Match', v: d.job_match_percent !== null ? `${d.job_match_percent}%` : 'N/A', c: 'bg-purple-50 text-purple-700 border-purple-200' },
          { l: 'Grade', v: d.overall_grade, c: 'bg-blue-50 text-blue-700 border-blue-200' },
          { l: 'Keywords Found', v: `${d.keywords.present.length}/${d.keywords.total_expected}`, c: 'bg-gray-50 text-gray-700 border-gray-200' },
        ].map(s => <div key={s.l} className={clsx('p-4 rounded-xl border text-center', s.c)}><p className="text-2xl font-extrabold">{s.v}</p><p className="text-xs font-medium mt-1">{s.l}</p></div>)}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h2 className="font-semibold text-gray-800 mb-3">Grade Reasoning</h2><p className="text-sm text-gray-600 leading-relaxed">{d.grade_reasoning}</p></div>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Strengths</h2>
          <ul className="space-y-2">{d.strengths.map((s, i) => <li key={i} className="flex gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">ATS Checks</h2>
          <div className="space-y-2">{(Object.entries(d.ats_scan) as [string, string][]).map(([k, v]) => {
            const labels: Record<string, string> = { file_format: 'File Format', text_readability: 'Readability', section_detection: 'Sections', keyword_extraction: 'Keywords', formatting: 'Formatting' };
            const ok = ['Pass', 'Good', 'Excellent', 'Successful'].includes(v);
            return <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0"><span className="text-sm text-gray-600">{labels[k]}</span><span className={clsx('text-sm font-bold', ok ? 'text-green-600' : 'text-amber-600')}>{v}</span></div>;
          })}</div>
        </div>
      </div>
    </div>
  );
}
