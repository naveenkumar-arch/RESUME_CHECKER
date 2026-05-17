import { useResume } from '../context/ResumeContext';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function SkillGap() {
  const { analysis } = useResume();
  if (!analysis) return <div className="text-gray-400 text-center py-20">No data — upload a resume first.</div>;
  const d = analysis.skill_gap;
  const matched = d.required_skills.filter(r => d.candidate_skills.map(c => c.toLowerCase()).includes(r.toLowerCase()));
  const gap = d.required_skills.filter(r => !d.candidate_skills.map(c => c.toLowerCase()).includes(r.toLowerCase()));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1><p className="text-sm text-gray-500 mt-1">Comparing your skills to the role requirements.</p></div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between mb-2"><span className="font-semibold text-gray-700">Skill Match</span><span className="text-2xl font-extrabold text-purple-600">{d.match_percent}%</span></div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${d.match_percent}%` }} transition={{ duration: 1.5 }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ l: 'Your Skills', n: d.candidate_skills.length, c: 'text-green-600 bg-green-50 border-green-200' }, { l: 'Matched', n: matched.length, c: 'text-blue-600 bg-blue-50 border-blue-200' }, { l: 'Gap', n: gap.length, c: 'text-red-600 bg-red-50 border-red-200' }].map(s => (
          <div key={s.l} className={`p-5 rounded-xl border text-center ${s.c}`}><p className="text-3xl font-extrabold">{s.n}</p><p className="text-sm font-medium mt-1">{s.l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Matched Skills ✅</h2>
          <div className="flex flex-wrap gap-2">{matched.map(s => <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{s}</span>)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Skill Gaps ❌</h2>
          <div className="flex flex-wrap gap-2">{gap.map(s => <span key={s} className={clsx('px-3 py-1.5 text-sm rounded-lg border', 'bg-red-50 text-red-600 border-red-200')}>{s}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
