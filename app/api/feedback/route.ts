import { NextRequest, NextResponse } from 'next/server';
import { saveFeedback, updateInterviewStatus } from '@/lib/actions';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { interviewId, userId, domainLabel, difficulty, transcript } = await req.json();

    const transcriptText = transcript
      .map((t: { role: string; content: string }) =>
        `${t.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.content}`
      )
      .join('\n\n');

    const prompt = `You are a senior ${domainLabel} hiring manager analyzing a mock interview.
Difficulty level: ${difficulty}

Interview Transcript:
${transcriptText}

Analyze the candidate's performance and return ONLY valid JSON (no markdown, no backticks):
{
  "overallScore": <integer 0-100>,
  "verdict": "<Strong Hire | Hire | Maybe | No Hire>",
  "summary": "<2-3 sentence overall assessment>",
  "categories": [
    {
      "name": "Technical Knowledge",
      "score": <0-100>,
      "feedback": "<specific, constructive feedback referencing actual answers>",
      "rating": "<excellent | good | average | poor>"
    },
    {
      "name": "Communication Clarity",
      "score": <0-100>,
      "feedback": "<specific feedback>",
      "rating": "<excellent | good | average | poor>"
    },
    {
      "name": "Problem-Solving Approach",
      "score": <0-100>,
      "feedback": "<specific feedback>",
      "rating": "<excellent | good | average | poor>"
    },
    {
      "name": "Domain Experience",
      "score": <0-100>,
      "feedback": "<specific feedback>",
      "rating": "<excellent | good | average | poor>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "nextSteps": ["<actionable step 1>", "<actionable step 2>", "<actionable step 3>"]
}`;

const result = await ai.models.generateContent({
  model: 'gemini-3.5-flash',
  contents: prompt,
  config: { responseMimeType: "application/json" },
});
const text = (result.text ?? '').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from Gemini');
    const analysis = JSON.parse(jsonMatch[0]);

    const feedback = await saveFeedback({
      interviewId,
      userId,
      ...analysis,
    });

    await updateInterviewStatus(interviewId, 'completed', {
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('Feedback generation error:', err);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
