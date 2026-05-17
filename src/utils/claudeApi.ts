import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeAnalysis } from '../types';

const SYSTEM_PROMPT = `You are a strict, senior technical recruiter and ATS system expert with 15 years of experience. Your job is to objectively evaluate resumes. Be honest and critical. Do NOT inflate scores. A poor resume should score low. A non-resume document should be flagged immediately.

Analyze the provided resume text against the job description (if provided).
Return ONLY a valid JSON object — no markdown, no explanation, no preamble.

JSON Schema to return:
{
  "is_resume": boolean,
  "rejection_reason": string or null,
  "ats_score": number between 0 and 100 strictly evaluated,
  "ats_verdict": one of "Poor" or "Average" or "Good" or "Excellent",
  "ats_breakdown": {
    "formatting": number 0 to 20,
    "keywords": number 0 to 20,
    "sections": number 0 to 20,
    "readability": number 0 to 20,
    "length_appropriateness": number 0 to 20
  },
  "overall_grade": one of "A+" or "A" or "B+" or "B" or "C+" or "C" or "D" or "F",
  "grade_reasoning": string,
  "job_match_percent": number or null if no job description,
  "job_title_detected": string or null,
  "job_match_verdict": string,
  "keywords": {
    "present": array of strings,
    "missing": array of strings,
    "total_expected": number
  },
  "skill_gap": {
    "candidate_skills": array of strings,
    "required_skills": array of strings,
    "match_percent": number
  },
  "strengths": array of 5 specific strings,
  "improvements": array of 5 specific strings,
  "quick_suggestions": array of 5 specific strings,
  "ats_scan": {
    "file_format": "Pass" or "Fail",
    "text_readability": "Good" or "Average" or "Poor",
    "section_detection": "Successful" or "Partial" or "Failed",
    "keyword_extraction": "Successful" or "Partial" or "Failed",
    "formatting": "Good" or "Average" or "Poor"
  },
  "experience_years": number or null,
  "detected_sections": array of strings,
  "missing_sections": array of strings,
  "contact_info_present": boolean,
  "summary_present": boolean,
  "education_present": boolean
}`;

export async function analyzeWithClaude(
  resumeText: string,
  jobDescription: string,
  apiKey: string
): Promise<ClaudeAnalysis> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const userMessage = `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || 'Not provided'}`;

  let rawText = '';

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = message.content[0];
    rawText = block.type === 'text' ? block.text : '';
  } catch (err: unknown) {
    // If opus fails, try haiku
    if (err instanceof Error && err.message.includes('model')) {
      const client2 = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const msg2 = await client2.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });
      const block2 = msg2.content[0];
      rawText = block2.type === 'text' ? block2.text : '';
    } else {
      throw err;
    }
  }

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: ClaudeAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Retry: extract JSON between first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } else {
      throw new Error('Analysis failed: Could not parse AI response. Please try again.');
    }
  }

  return parsed;
}
