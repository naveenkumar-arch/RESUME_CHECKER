import type { AnalysisResult } from '../types';

const GEMINI_PROMPT = (resumeText: string, jobDescription: string) => `
You are an expert ATS resume analyzer and career coach. Analyze the following resume and return a comprehensive JSON analysis.

RESUME TEXT:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription || 'Not provided - analyze the resume for general software/tech job quality'}
"""

Return ONLY valid JSON (no markdown, no extra text) with EXACTLY this structure:
{
  "atsScore": <integer 0-100, ATS compatibility score>,
  "jobMatch": <integer 0-100, job description match percentage or 65 if no JD>,
  "matchedJobTitle": "<detected job title from resume>",
  "grade": "<one of: A+, A, A-, B+, B, B-, C+, C, D, F>",
  "gradeLabel": "<one of: Excellent, Very Good, Good, Above Average, Average, Below Average, Poor>",
  "gradeDescription": "<2 concise sentences about the overall resume quality>",
  "keywords": {
    "present": ["<up to 20 keywords found in both resume and JD or general industry terms>"],
    "missing": ["<up to 15 important keywords missing from the resume>"]
  },
  "skills": {
    "yours": ["<skills found in the resume, max 20>"],
    "required": ["<skills required for the role or general tech skills, max 20>"]
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>",
    "<specific strength 4>",
    "<specific strength 5>"
  ],
  "improvements": [
    "<specific improvement 1>",
    "<specific improvement 2>",
    "<specific improvement 3>",
    "<specific improvement 4>",
    "<specific improvement 5>"
  ],
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>",
    "<actionable suggestion 5>"
  ],
  "atsChecks": {
    "fileFormat": "<PDF or DOCX>",
    "textReadability": "<Excellent, Good, Fair, or Poor>",
    "sectionDetection": "<Successful, Partial, or Failed>",
    "keywordExtraction": "<Successful, Partial, or Failed>",
    "formatting": "<Excellent, Good, Fair, or Poor>"
  },
  "detailedFeedback": {
    "summary": "<3-4 sentence comprehensive summary of the resume>",
    "experienceAnalysis": "<2-3 sentences analyzing work experience section>",
    "educationAnalysis": "<1-2 sentences analyzing education section>",
    "skillsAnalysis": "<2-3 sentences analyzing the skills section>",
    "formatAnalysis": "<2-3 sentences analyzing the formatting and structure>"
  },
  "keywordAnalysis": {
    "presentKeywords": [
      {"keyword": "<keyword>", "frequency": <count>, "importance": "<High, Medium, or Low>"}
    ],
    "missingKeywords": [
      {"keyword": "<keyword>", "importance": "<High, Medium, or Low>", "reason": "<why it matters>"}
    ]
  }
}
`;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  apiKey: string
): Promise<AnalysisResult> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = GEMINI_PROMPT(resumeText, jobDescription);

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Clean up any markdown code blocks if the model wraps it
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(cleaned) as AnalysisResult;
}

export const MOCK_ANALYSIS: AnalysisResult = {
  atsScore: 78,
  jobMatch: 72,
  matchedJobTitle: "Frontend Developer",
  grade: "B+",
  gradeLabel: "Good",
  gradeDescription: "Your resume demonstrates solid technical skills and relevant experience. A few targeted improvements will significantly boost your ATS score and interview chances.",
  keywords: {
    present: ["JavaScript", "React", "HTML", "CSS", "Git", "REST API", "Node.js", "Agile", "SQL", "Python"],
    missing: ["TypeScript", "Next.js", "Docker", "AWS", "CI/CD", "Tailwind CSS", "Redux", "GraphQL", "Jest", "Kubernetes"],
  },
  skills: {
    yours: ["JavaScript", "React", "HTML5", "CSS3", "Git", "Node.js", "Python", "SQL", "REST APIs", "Agile"],
    required: ["TypeScript", "React", "Next.js", "Node.js", "Docker", "AWS", "CI/CD", "GraphQL", "Jest", "Tailwind CSS", "Redux", "SQL"],
  },
  strengths: [
    "Well-structured layout with clear section hierarchy",
    "Good use of action verbs in experience descriptions",
    "Relevant technical skills prominently displayed",
    "Clean and readable formatting suitable for ATS",
    "Strong educational background listed clearly",
  ],
  improvements: [
    "Add quantifiable achievements with metrics and numbers",
    "Include a professional summary at the top",
    "Add missing high-demand keywords naturally",
    "Include links to GitHub portfolio and LinkedIn",
    "Add relevant certifications or online courses",
  ],
  suggestions: [
    "Add specific metrics like 'Improved load time by 40%' to achievements",
    "Use industry-standard keywords like TypeScript and Docker",
    "Include a GitHub link with active projects",
    "Add a brief professional summary at the top of the resume",
    "Keep bullet points to 1–2 lines each for ATS readability",
  ],
  atsChecks: {
    fileFormat: "PDF",
    textReadability: "Good",
    sectionDetection: "Successful",
    keywordExtraction: "Successful",
    formatting: "Good",
  },
  detailedFeedback: {
    summary: "This is a well-structured resume that covers the essential sections expected by ATS systems. The candidate demonstrates relevant technical skills and experience, but could benefit from more specific, quantifiable achievements to stand out among applicants.",
    experienceAnalysis: "The work experience section lists responsibilities clearly but lacks measurable impact. Adding numbers, percentages, and specific outcomes would significantly strengthen these entries and improve both ATS ranking and human reviewer impressions.",
    educationAnalysis: "Educational background is properly listed with degree, institution, and graduation year. Consider adding relevant coursework or academic projects if applying for entry-to-mid level positions.",
    skillsAnalysis: "The skills section covers core frontend technologies well. However, several high-demand tools like TypeScript, Docker, and AWS are missing, which could lower match scores for many modern job postings.",
    formatAnalysis: "The resume format is clean and ATS-friendly with proper use of headings and bullet points. Ensure consistent formatting throughout and avoid tables or complex layouts that some ATS systems may struggle to parse.",
  },
  keywordAnalysis: {
    presentKeywords: [
      { keyword: "JavaScript", frequency: 4, importance: "High" },
      { keyword: "React", frequency: 3, importance: "High" },
      { keyword: "HTML/CSS", frequency: 2, importance: "Medium" },
      { keyword: "Git", frequency: 2, importance: "Medium" },
      { keyword: "REST API", frequency: 2, importance: "High" },
      { keyword: "Node.js", frequency: 1, importance: "Medium" },
      { keyword: "Python", frequency: 1, importance: "Medium" },
      { keyword: "SQL", frequency: 1, importance: "Medium" },
      { keyword: "Agile", frequency: 1, importance: "Low" },
      { keyword: "Team Collaboration", frequency: 1, importance: "Low" },
    ],
    missingKeywords: [
      { keyword: "TypeScript", importance: "High", reason: "Required in 90% of modern frontend roles" },
      { keyword: "Next.js", importance: "High", reason: "Most popular React framework for production apps" },
      { keyword: "Docker", importance: "High", reason: "Standard containerization tool in modern devops" },
      { keyword: "AWS", importance: "High", reason: "Leading cloud platform requested in most JDs" },
      { keyword: "CI/CD", importance: "Medium", reason: "Essential for modern software delivery pipelines" },
      { keyword: "Tailwind CSS", importance: "Medium", reason: "Widely adopted utility CSS framework" },
      { keyword: "Redux", importance: "Medium", reason: "Common state management library for React" },
      { keyword: "Jest", importance: "Medium", reason: "Standard testing framework for JavaScript" },
    ],
  },
};
