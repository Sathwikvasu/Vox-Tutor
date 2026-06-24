import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { domain, domainLabel, difficulty, topics, numQuestions } = await req.json();

    const difficultyContext: Record<string, string> = {
      entry:  'a fresh graduate or junior with 0–2 years of experience',
      mid:    'a mid-level professional with 2–5 years of experience',
      senior: 'a senior professional with 5+ years of experience',
    };

    const prompt = `You are an expert ${domainLabel} interviewer at a top firm.
Generate exactly ${numQuestions} high-quality interview questions for ${difficultyContext[difficulty]}.
Domain: ${domainLabel}
Key topics to cover: ${topics.join(', ')}

Requirements:
- Questions should be progressively deeper (start accessible, end challenging)
- Each question should be standalone and clear when spoken aloud
- Mix conceptual, behavioral, and situational questions
- Do NOT number the questions
- Return ONLY a JSON array of strings, no other text

Example format: ["Question one?", "Question two?"]`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON safely
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid response format');
    const questions: string[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Question generation error:', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
