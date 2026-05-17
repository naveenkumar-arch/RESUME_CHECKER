import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Lightbulb, Trophy, BarChart2, ChevronRight, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useResume } from '../context/ResumeContext';
import Modal from '../components/Modal';
import type { ClaudeAnalysis } from '../types';

function Counter({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0; const step = Math.ceil(to / 50);
    const t = setInterval(() => { n = Math.min(n + step, to); setV(n); if (n >= to) clearInterval(t); }, 25);
    return () => clearInterval(t);
  }, [to]);
  return <>{v}</>;
}

function ProgressBar({ pct, color = 'bg-purple-500' }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div className={`h-full ${color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2 }} />
    </div>
  );
}

function atsColor(score: number) {
  if (score >= 86) return { ring: 'text-blue-500', badge: 'bg-blue-50 text-blue-700', label: 'Excellent' };
  if (score >= 75) return { ring: 'text-green-500', badge: 'bg-green-50 text-green-700', label: 'Good Score' };
  if (score >= 61) return { ring: 'text-yellow-500', badge: 'bg-yellow-50 text-yellow-700', label: 'Average' };
  if (score >= 41) return { ring: 'text-orange-500', badge: 'bg-orange-50 text-orange-700', label: 'Below Average' };
  return { ring: 'text-red-500', badge: 'bg-red-50 text-red-700', label: 'Needs Major Work' };
}

function gradeStyle(grade: string) {
  if (['A+', 'A'].includes(grade)) return 'border-green-300 bg-green-50 text-green-700';
  if (['B+', 'B'].includes(grade)) return 'border-blue-300 bg-blue-50 text-blue-700';
  if (['C+', 'C'].includes(grade)) return 'border-yellow-300 bg-yellow-50 text-yellow-700';
  return 'border-red-300 bg-red-50 text-red-700';
}

function matchColor(pct: number | null) {
  if (pct === null) return 'text-gray-400';
  if (pct >= 81) return 'text-purple-600';
  if (pct >= 66) return 'text-green-600';
  if (pct >= 41) return 'text-orange-500';
  return 'text-red-500';
}

export default function Dashboard() {
  const { analysis } = useResume();
  const [modal, setModal] = useState<string | null>(null);
  const close = () => setModal(null);

  if (!analysis) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><Info className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No analysis data. Upload a resume first.</p></div>
    </div>
  );

  const d: ClaudeAnalysis = analysis;
  const ats = atsColor(d.ats_score);
  const skillPct = d.skill_gap.match_percent;
  const totalKw = d.keywords.present.length + d.keywords.missing.length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ATS Score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">ATS Score</p>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-gray-100" strokeWidth="8" cx="50" cy="50" r="40" fill="none" />
                <motion.circle className={clsx('stroke-current', ats.ring)} strokeWidth="8" strokeLinecap="round"
                  cx="50" cy="50" r="40" fill="none"
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: `${d.ats_score * 2.51} 251` }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900"><Counter to={d.ats_score} /></span>
                <span className="text-[10px] text-gray-400">/100</span>
              </div>
            </div>
            <div>
              <span className={clsx('text-xs font-bold px-2 py-1 rounded-lg', ats.badge)}>{ats.label}</span>
              <p className="text-xs text-gray-500 mt-2 mb-3 leading-relaxed">{d.grade_reasoning.slice(0, 100)}…</p>
              <button onClick={() => setModal('ats')} className="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 flex items-center gap-1">
                View Breakdown <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Job Match */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Job Match</p>
          {d.job_match_percent === null ? (
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">No job description provided — add one for accurate matching.</p>
              </div>
              <p className="text-sm font-semibold text-gray-600">{d.job_title_detected ?? 'Role not detected'}</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-gray-800 truncate">{d.job_title_detected ?? 'Detected Role'}</span>
                <span className={clsx('text-3xl font-extrabold ml-2', matchColor(d.job_match_percent))}><Counter to={d.job_match_percent} />%</span>
              </div>
              <ProgressBar pct={d.job_match_percent} color="bg-purple-500" />
              <p className="text-xs text-gray-500 mt-2 mb-4">{d.job_match_verdict}</p>
              <button onClick={() => setModal('job')} className="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 flex items-center gap-1">
                View Analysis <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Overall Grade */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Overall Grade</p>
          <div className="flex items-center gap-5">
            <div className={clsx('w-20 h-20 rounded-full border-4 flex items-center justify-center flex-shrink-0', gradeStyle(d.overall_grade))}>
              <span className="text-2xl font-extrabold">{d.overall_grade}</span>
            </div>
            <div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{d.grade_reasoning.slice(0, 120)}</p>
              <button onClick={() => setModal('suggestions')} className="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 flex items-center gap-1">
                View Suggestions <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Keywords */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Keyword Analysis</p>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Present', count: d.keywords.present.length, pct: totalKw ? Math.round((d.keywords.present.length / totalKw) * 100) : 0, color: 'bg-green-500', icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, tag: 'Found', tc: 'text-green-600' },
              { label: 'Missing', count: d.keywords.missing.length, pct: totalKw ? Math.round((d.keywords.missing.length / totalKw) * 100) : 0, color: 'bg-amber-400', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, tag: 'Add These', tc: 'text-amber-600' },
              { label: 'Total Expected', count: d.keywords.total_expected, pct: 100, color: 'bg-blue-400', icon: <BarChart2 className="w-4 h-4 text-blue-500" />, tag: '', tc: '' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">{row.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{row.label}</span>
                    <span className="font-bold text-gray-900">{row.count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className={`h-full ${row.color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ duration: 1.2 }} />
                    </div>
                    {row.tag && <span className={clsx('text-[10px] font-bold', row.tc)}>{row.tag}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setModal('keywords')} className="mt-5 w-full text-xs text-purple-600 border border-purple-200 rounded-lg py-2 hover:bg-purple-50">View All Keywords</button>
        </div>

        {/* Skill Gap */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Skill Gap</p>
          <div className="flex justify-between items-center mb-6 relative">
            <div className="text-center w-5/12">
              <p className="text-xs text-gray-400 mb-1">Your Skills</p>
              <p className="text-3xl font-extrabold text-green-600"><Counter to={d.skill_gap.candidate_skills.length} /></p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">vs</div>
            <div className="text-center w-5/12">
              <p className="text-xs text-gray-400 mb-1">Required</p>
              <p className="text-3xl font-extrabold text-purple-600"><Counter to={d.skill_gap.required_skills.length} /></p>
            </div>
          </div>
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700">Skill Match</span>
              <span className="font-bold"><Counter to={skillPct} />%</span>
            </div>
            <ProgressBar pct={skillPct} color="bg-purple-500" />
          </div>
          <button onClick={() => setModal('skillgap')} className="mt-auto w-full text-xs text-purple-600 border border-purple-200 rounded-lg py-2 hover:bg-purple-50">View Skill Gap</button>
        </div>

        {/* Missing Keywords */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Top Missing Keywords</p>
          <div className="flex flex-wrap gap-2 flex-1 content-start">
            {d.keywords.missing.slice(0, 9).map((kw, i) => (
              <motion.span key={kw} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                title="Add this skill to your resume"
                className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100 hover:bg-red-100 cursor-pointer transition-colors">
                {kw}
              </motion.span>
            ))}
          </div>
          <button onClick={() => setModal('missing')} className="mt-5 w-full text-xs text-purple-600 border border-purple-200 rounded-lg py-2 hover:bg-purple-50">View All Missing</button>
        </div>
      </div>

      {/* Row 3 – Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: 'Resume Strengths', items: d.strengths, type: 'success' as const, Icon: CheckCircle2, Deco: Trophy },
          { title: 'Areas to Improve', items: d.improvements, type: 'warning' as const, Icon: AlertTriangle, Deco: BarChart2 },
          { title: 'Quick Suggestions', items: d.quick_suggestions, type: 'primary' as const, Icon: Lightbulb, Deco: Lightbulb },
        ].map(({ title, items, type, Icon, Deco }) => {
          const c = { success: { i: 'text-green-500', d: 'bg-green-50 text-green-500' }, warning: { i: 'text-amber-500', d: 'bg-amber-50 text-amber-500' }, primary: { i: 'text-purple-500', d: 'bg-purple-50 text-purple-500' } }[type];
          return (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center', c.d)}><Deco className="w-4 h-4" /></div>
              </div>
              <ul className="space-y-2.5 flex-1">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', c.i)} />{item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Row 4 – ATS Scan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <p className="text-sm font-semibold text-gray-800">ATS Scan Preview</p>
          <span className={clsx('px-2 py-0.5 text-xs font-bold rounded', d.ats_scan.section_detection === 'Successful' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
            {d.ats_scan.section_detection === 'Successful' ? 'PASSED' : 'PARTIAL'}
          </span>
        </div>
        <div className="flex flex-wrap gap-6 items-center justify-between">
          {([
            ['File Format', d.ats_scan.file_format],
            ['Text Readability', d.ats_scan.text_readability],
            ['Section Detection', d.ats_scan.section_detection],
            ['Keyword Extraction', d.ats_scan.keyword_extraction],
            ['Formatting', d.ats_scan.formatting],
          ] as [string, string][]).map(([label, val]) => {
            const ok = ['Pass', 'Good', 'Excellent', 'Successful'].includes(val);
            return (
              <div key={label} className="flex items-start gap-2">
                <CheckCircle2 className={clsx('w-4 h-4 mt-0.5', ok ? 'text-green-500' : 'text-amber-500')} />
                <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-900">{val}</p></div>
              </div>
            );
          })}
          <button onClick={() => setModal('scan')} className="text-sm text-purple-600 border border-purple-200 rounded-lg px-4 py-2 hover:bg-purple-50 ml-auto">Full Scan Report</button>
        </div>
      </div>

      {/* Extra Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-4">Document Intelligence</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Experience', val: d.experience_years !== null ? `${d.experience_years} yrs` : 'N/A' },
            { label: 'Contact Info', val: d.contact_info_present ? '✅ Present' : '❌ Missing' },
            { label: 'Summary', val: d.summary_present ? '✅ Present' : '❌ Missing' },
            { label: 'Education', val: d.education_present ? '✅ Present' : '❌ Missing' },
          ].map(({ label, val }) => (
            <div key={label} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{val}</p>
            </div>
          ))}
        </div>
        {d.missing_sections.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs font-semibold text-red-700 mb-1">Missing Sections:</p>
            <div className="flex flex-wrap gap-2">{d.missing_sections.map(s => <span key={s} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">{s}</span>)}</div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={modal === 'ats'} onClose={close} title="ATS Score Breakdown" size="lg">
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-semibold">Total ATS Score</span>
            <span className={clsx('text-2xl font-extrabold', ats.ring)}>{d.ats_score}/100</span>
          </div>
          {(Object.entries(d.ats_breakdown) as [string, number][]).map(([k, v]) => {
            const labels: Record<string, string> = { formatting: 'Formatting', keywords: 'Keywords', sections: 'Sections', readability: 'Readability', length_appropriateness: 'Length' };
            return (
              <div key={k}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{labels[k]}</span><span className="font-bold">{v}/20</span></div>
                <ProgressBar pct={(v / 20) * 100} color={v >= 15 ? 'bg-green-500' : v >= 10 ? 'bg-amber-400' : 'bg-red-400'} />
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={modal === 'job'} onClose={close} title="Job Match Analysis" size="md">
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-purple-50 rounded-xl">
            <div><p className="text-xs text-gray-400">Matched Role</p><p className="font-bold">{d.job_title_detected}</p></div>
            <span className="text-3xl font-extrabold text-purple-600">{d.job_match_percent ?? 'N/A'}%</span>
          </div>
          <p className="text-sm text-gray-600">{d.job_match_verdict}</p>
        </div>
      </Modal>

      <Modal isOpen={modal === 'suggestions'} onClose={close} title="Suggestions" size="md">
        <div className="space-y-3">
          {d.quick_suggestions.map((s, i) => (
            <div key={i} className="flex gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{s}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={modal === 'keywords'} onClose={close} title="All Keywords" size="xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-green-700 mb-3">Present ({d.keywords.present.length})</p>
            <div className="flex flex-wrap gap-2">{d.keywords.present.map(k => <span key={k} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">{k}</span>)}</div>
          </div>
          <div>
            <p className="text-sm font-bold text-red-600 mb-3">Missing ({d.keywords.missing.length})</p>
            <div className="flex flex-wrap gap-2">{d.keywords.missing.map(k => <span key={k} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">{k}</span>)}</div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'skillgap'} onClose={close} title="Skill Gap Detail" size="xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-green-700 mb-3">Your Skills</p>
            <div className="flex flex-wrap gap-2">{d.skill_gap.candidate_skills.map(s => <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">{s}</span>)}</div>
          </div>
          <div>
            <p className="text-sm font-bold text-purple-700 mb-3">Required Skills</p>
            <div className="flex flex-wrap gap-2">{d.skill_gap.required_skills.map(s => {
              const has = d.skill_gap.candidate_skills.map(c => c.toLowerCase()).includes(s.toLowerCase());
              return <span key={s} className={clsx('px-2.5 py-1 text-xs rounded-lg border', has ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200')}>{s}</span>;
            })}</div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'missing'} onClose={close} title="All Missing Keywords" size="md">
        <div className="flex flex-wrap gap-2">{d.keywords.missing.map(k => <span key={k} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 cursor-pointer">{k}</span>)}</div>
        <p className="text-xs text-gray-400 mt-4">💡 Add these naturally to your resume to improve ATS scores.</p>
      </Modal>

      <Modal isOpen={modal === 'scan'} onClose={close} title="Full ATS Scan Report" size="md">
        <div className="space-y-3">
          {([['File Format', d.ats_scan.file_format], ['Text Readability', d.ats_scan.text_readability], ['Section Detection', d.ats_scan.section_detection], ['Keyword Extraction', d.ats_scan.keyword_extraction], ['Formatting', d.ats_scan.formatting]] as [string, string][]).map(([label, val]) => {
            const ok = ['Pass', 'Good', 'Excellent', 'Successful'].includes(val);
            return (
              <div key={label} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2"><CheckCircle2 className={clsx('w-4 h-4', ok ? 'text-green-500' : 'text-amber-500')} /><span className="text-sm font-medium text-gray-700">{label}</span></div>
                <span className={clsx('text-sm font-bold', ok ? 'text-green-600' : 'text-amber-600')}>{val}</span>
              </div>
            );
          })}
        </div>
      </Modal>
    </motion.div>
  );
}
