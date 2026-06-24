import { getCurrentUser, getInterview, getFeedback } from '@/lib/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DOMAINS } from '@/lib/constants';
import { CheckCircle, AlertCircle, XCircle, ArrowLeft, RotateCcw, TrendingUp } from 'lucide-react';
import { Feedback } from '@/types';

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color  = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        fill={color} fontSize={size * 0.22} fontFamily="Inter" fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

export default async function FeedbackPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const [interview, feedback] = await Promise.all([
    getInterview(params.id),
    getFeedback(params.id),
  ]);

  if (!interview || interview.userId !== user.uid) redirect('/dashboard');

  const domain = DOMAINS.find(d => d.id === interview.domain);

  const verdictConfig: Record<string, { cls: string; icon: typeof CheckCircle; bg: string }> = {
    'Strong Hire': { cls: 'text-success', icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200' },
    'Hire':        { cls: 'text-success', icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200' },
    'Maybe':       { cls: 'text-warning',  icon: AlertCircle, bg: 'bg-amber-50 border-amber-200'   },
    'No Hire':     { cls: 'text-danger',   icon: XCircle,     bg: 'bg-red-50 border-red-200'       },
  };

  if (!feedback) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-ink-secondary mb-4">Feedback is still being generated...</p>
        <Link href="/dashboard" className="btn-secondary">← Back to dashboard</Link>
      </div>
    );
  }

  const vc = verdictConfig[feedback.verdict] ?? verdictConfig['Maybe'];
  const VerdictIcon = vc.icon;

  const ratingColor: Record<string, string> = {
    excellent: 'text-success',
    good:      'text-brand-600',
    average:   'text-warning',
    poor:      'text-danger',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <Link href="/dashboard" className="btn-ghost gap-1.5 mb-6 -ml-1 text-ink-muted">
        <ArrowLeft size={15} /> Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-3xl">{domain?.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Feedback Report</h1>
          <p className="text-sm text-ink-muted capitalize">{interview.domainLabel} · {interview.difficulty} level</p>
        </div>
      </div>

      {/* Score hero */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={feedback.overallScore} size={110} />

          <div className="flex-1 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-3 ${vc.bg} ${vc.cls}`}>
              <VerdictIcon size={16} />
              {feedback.verdict}
            </div>
            <p className="text-ink-secondary leading-relaxed">{feedback.summary}</p>
          </div>

          {/* Mini rings */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {feedback.categories.map(cat => (
              <div key={cat.name} className="flex flex-col items-center gap-1">
                <ScoreRing score={cat.score} size={56} />
                <p className="text-xs text-ink-muted text-center leading-tight w-16">{cat.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <h2 className="font-semibold text-ink mb-4">Detailed breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {feedback.categories.map(cat => {
          const barW = `${cat.score}%`;
          const barColor = cat.score >= 75 ? 'bg-success' : cat.score >= 50 ? 'bg-warning' : 'bg-danger';
          return (
            <div key={cat.name} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-ink">{cat.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold capitalize ${ratingColor[cat.rating]}`}>{cat.rating}</span>
                  <span className="font-bold text-ink">{cat.score}</span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-200 rounded-full mb-3 overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: barW }} />
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed">{cat.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths & improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-success" /> Strengths
          </h3>
          <ul className="space-y-2.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-warning" /> Areas to improve
          </h3>
          <ul className="space-y-2.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next steps */}
      <div className="card p-6 mb-8">
        <h3 className="font-semibold text-ink mb-4">Recommended next steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedback.nextSteps.map((step, i) => (
            <div key={i} className="bg-brand-50 rounded-2xl p-4">
              <div className="text-brand-600 font-bold text-lg mb-2">0{i + 1}</div>
              <p className="text-sm text-ink-secondary leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript */}
      {interview.transcript && interview.transcript.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="font-semibold text-ink mb-4">Interview transcript</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {interview.transcript.map((entry, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className={`font-semibold flex-shrink-0 ${entry.role === 'interviewer' ? 'text-brand-600' : 'text-ink'}`}>
                  {entry.role === 'interviewer' ? 'Alex:' : 'You:'}
                </span>
                <span className="text-ink-secondary leading-relaxed">{entry.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-4">
        <Link href="/dashboard" className="btn-secondary gap-2">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <Link href="/dashboard" className="btn-primary gap-2">
          <RotateCcw size={16} /> Practice again
        </Link>
      </div>
    </div>
  );
}
