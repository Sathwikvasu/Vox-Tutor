'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { DOMAINS, DIFFICULTIES, DURATIONS } from '@/lib/constants';
import { createInterview } from '@/lib/actions';

// Props passed from server component (dashboard page knows the userId)
export default function NewInterviewButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [domainId,   setDomainId]   = useState('');
  const [difficulty, setDifficulty] = useState<'entry' | 'mid' | 'senior'>('mid');
  const [duration,   setDuration]   = useState(20);

  const domain = DOMAINS.find(d => d.id === domainId);

  const handleStart = async () => {
    if (!domain) return;
    setLoading(true);
    setError('');

    try {
      // 1. Generate questions via Gemini on the server
      const numQ = DURATIONS.find(d => d.value === duration)?.questions ?? 5;
      const genRes = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.id,
          domainLabel: domain.label,
          difficulty,
          topics: domain.topics,
          numQuestions: numQ,
        }),
      });

      if (!genRes.ok) throw new Error('Question generation failed');
      const { questions } = await genRes.json();

      // 2. Create interview in Firestore (questions saved here — no URL length issue)
      const interview = await createInterview({
        userId,
        domain:      domain.id,
        domainLabel: domain.label,
        domainIcon:  domain.icon,
        difficulty,
        duration,
        questions,
      });

      // 3. Navigate to interview room — just the ID, questions loaded from Firestore
      setOpen(false);
      router.push(`/interview/${interview.id}`);

    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setOpen(false); setStep(1); setDomainId(''); setError(''); };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary gap-2">
        <Plus size={16} /> New interview
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
              <div>
                <h2 className="font-bold text-ink text-lg">New Interview</h2>
                <div className="flex gap-1 mt-2">
                  {[1, 2].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${
                      s <= step ? 'bg-brand-600 w-8' : 'bg-surface-200 w-4'
                    }`} />
                  ))}
                </div>
              </div>
              <button onClick={close} className="btn-ghost p-2 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">

              {/* Step 1 — Domain */}
              {step === 1 && (
                <>
                  <p className="label mb-4">What are you interviewing for?</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {DOMAINS.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDomainId(d.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all hover:border-brand-300 ${
                          domainId === d.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-surface-200 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{d.icon}</div>
                        <div className="font-medium text-sm text-ink leading-snug">{d.label}</div>
                        <div className="text-xs text-ink-muted mt-0.5">{d.description}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!domainId}
                    className="btn-primary w-full gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Step 2 — Settings */}
              {step === 2 && (
                <>
                  {/* Level */}
                  <div className="mb-5">
                    <p className="label mb-3">Your experience level</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            difficulty === d.value
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-surface-200 hover:border-brand-200'
                          }`}
                        >
                          <div className="font-semibold text-sm text-ink">{d.label}</div>
                          <div className="text-xs text-ink-muted mt-0.5">{d.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-5">
                    <p className="label mb-3">Interview duration</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DURATIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            duration === d.value
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-surface-200 hover:border-brand-200'
                          }`}
                        >
                          <div className="font-bold text-lg text-ink">{d.label}</div>
                          <div className="text-xs text-ink-muted">~{d.questions} questions</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="flex items-center gap-4 bg-surface-50 rounded-2xl p-4 mb-5">
                    <span className="text-3xl">{domain?.icon}</span>
                    <div>
                      <p className="font-semibold text-ink">{domain?.label}</p>
                      <p className="text-xs text-ink-muted capitalize mt-0.5">
                        {difficulty} level · {duration} min · ~{DURATIONS.find(d => d.value === duration)?.questions} questions
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-danger">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary gap-1.5">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button
                      onClick={handleStart}
                      disabled={loading}
                      className="btn-primary flex-1 gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Preparing...</>
                        : <><span>🎙️</span> Start Interview</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
