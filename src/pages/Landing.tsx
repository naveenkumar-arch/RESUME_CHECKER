import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, CheckCircle, Loader2,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Zap, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useResume } from '../context/ResumeContext';
import { extractTextFromFile } from '../utils/extractText';
import { analyzeWithGemini } from '../utils/aiApi';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTS = ['pdf', 'docx', 'doc', 'txt'];

const STEPS = [
  { id: 0, icon: '📄', label: 'Extracting text from document…' },
  { id: 1, icon: '🔍', label: 'Classifying document type…' },
  { id: 2, icon: '🤖', label: 'Running AI analysis…' },
  { id: 3, icon: '📊', label: 'Building your report…' },
];

export default function Landing() {
  const navigate = useNavigate();
  const {
    appState, setAppState, setAnalysis, setFileInfo, setAnalyzedAt,
    setError, errorMessage, addToast, addHistory, reset,
    analysis, fileName, charCount,
  } = useResume();

  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [activeStep, setActiveStep] = useState(-1);
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTS.includes(ext)) return 'Only PDF, DOCX, or TXT files are supported.';
    if (f.size > MAX_FILE_SIZE) return 'File size must be under 5MB.';
    return '';
  };

  const handleFileSet = (f: File) => {
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSet(e.dataTransfer.files[0]);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;

    setAppState('processing');
    setActiveStep(0);

    try {
      // Step 0: Extract text
      const text = await extractTextFromFile(file);
      if (text.length < 100) {
        setError('Could not extract readable content from this file. The file may be image-based or corrupted.');
        setAppState('error');
        return;
      }
      setFileInfo(file.name, file.size, text);
      setActiveStep(1);

      // Step 1 & 2: Gemini analysis (classification + scoring in one call)
      setActiveStep(2);
      const result = await analyzeWithGemini(text, jobDesc);
      setActiveStep(3);

      // Check if document is a resume
      if (!result.is_resume) {
        setAnalysis(result);
        setAppState('rejected');
        return;
      }

      // Step 3: Finalize
      const now = new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      });
      setAnalyzedAt(now);
      setAnalysis(result);
      addHistory({
        id: Date.now().toString(),
        fileName: file.name,
        analyzedAt: now,
        atsScore: result.ats_score,
        grade: result.overall_grade,
        jobTitle: result.job_title_detected,
      });

      setAppState('dashboard');
      addToast('✅ Resume analyzed successfully!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
      setAppState('error');
      addToast('Analysis failed: ' + msg, 'error');
    }
  };

  // ── PROCESSING STATE ──────────────────────────────────────
  if (appState === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-gray-100" strokeWidth="6" cx="50" cy="50" r="44" fill="none" />
              <motion.circle className="stroke-[#7C3AED]" strokeWidth="6" strokeLinecap="round"
                cx="50" cy="50" r="44" fill="none"
                strokeDasharray="276"
                animate={{ strokeDashoffset: 276 - ((activeStep + 1) / STEPS.length) * 276 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              {STEPS[Math.max(0, activeStep)]?.icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Resume</h2>
          <p className="text-sm text-purple-600 font-medium mb-8">
            {STEPS[Math.max(0, activeStep)]?.label}
          </p>
          <div className="space-y-3 text-left">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                {i < activeStep
                  ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : i === activeStep
                  ? <Loader2 className="w-5 h-5 text-purple-500 animate-spin flex-shrink-0" />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                }
                <span className={clsx('text-sm', i <= activeStep ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                  {step.icon} {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── REJECTED STATE ────────────────────────────────────────
  if (appState === 'rejected') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border border-red-200"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-3">Not a Resume</h2>
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 text-left">
            <p className="text-sm font-semibold text-red-800 mb-1">⚠️ This file does not appear to be a resume.</p>
            <p className="text-sm text-red-700">{analysis?.rejection_reason ?? 'The document could not be identified as a professional resume or CV.'}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Only professional resumes and CVs can be analyzed. Please upload your actual resume.</p>
          <button
            onClick={() => { reset(); setFile(null); setJobDesc(''); }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Upload a Different File
          </button>
        </motion.div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────
  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Analysis Failed</h2>
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 text-left">
            <p className="text-sm text-red-700">{errorMessage || 'An unexpected error occurred.'}</p>
          </div>
          <button
            onClick={() => { reset(); setFile(null); }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // ── UPLOAD STATE (default) ────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] right-[-8%] w-[45%] h-[45%] rounded-full bg-purple-200/25 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/60 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-300/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AI Resume Auditor</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Zap className="w-4 h-4 text-purple-500" />
          <span className="hidden sm:block">Powered by Gemini AI</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Strict · Honest · AI-Powered by Gemini
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Get an honest resume
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-blue-600">
              audit from AI
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Real analysis. Honest scores. No flattery. Upload your resume and get actionable feedback from Gemini AI.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-100/40 border border-gray-100 p-8 space-y-6">

            {/* File upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Upload Resume <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-2">(PDF / DOCX / TXT, max 5MB)</span>
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all group',
                  isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-400 hover:bg-gray-50',
                  file && !fileError && 'border-green-400 bg-green-50',
                  fileError && 'border-red-300 bg-red-50',
                )}
              >
                <input ref={fileInputRef} type="file" className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={e => e.target.files?.[0] && handleFileSet(e.target.files[0])} />
                {fileError ? (
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p className="text-sm font-semibold text-red-600">{fileError}</p>
                    <button className="text-xs text-purple-600 hover:underline" onClick={e => { e.stopPropagation(); setFileError(''); setFile(null); }}>Clear</button>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <button className="text-xs text-purple-600 hover:underline" onClick={e => { e.stopPropagation(); setFile(null); }}>Replace</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <UploadCloud className="w-12 h-12 text-gray-300 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
                    <p className="font-semibold text-gray-700">Click to upload or drag & drop</p>
                    <p className="text-sm text-gray-400">PDF, DOCX, or TXT</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Job Description <span className="text-gray-400 font-normal">(Recommended — higher accuracy)</span>
              </label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                className="w-full h-28 rounded-xl border border-gray-200 p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all placeholder:text-gray-400"
                placeholder="Paste the job description here for accurate matching scores…"
              />
              {!jobDesc.trim() && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Without a job description, match scores will be lower accuracy.
                </p>
              )}
            </div>

            {/* Debug info bar */}
            {charCount > 0 && (
              <div>
                <button onClick={() => setShowDebug(v => !v)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  {showDebug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Debug info — {charCount.toLocaleString()} chars extracted from {fileName}
                </button>
              </div>
            )}

            {/* CTA */}
            <button onClick={handleAnalyze} disabled={!file || !!fileError}
              className={clsx(
                'w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg',
                file && !fileError
                  ? 'bg-[#7C3AED] hover:bg-purple-700 shadow-purple-200/60 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              )}
            >
              <Zap className="w-5 h-5" />
              Analyze Resume with Gemini AI
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
