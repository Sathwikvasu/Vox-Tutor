import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Interview, Feedback } from '@/types';
import { DOMAINS } from '@/lib/constants';
import { ChevronRight, Mic, CheckCircle, Clock } from 'lucide-react';

dayjs.extend(relativeTime);

export default function InterviewCard({
  interview,
  feedback,
}: {
  interview: Interview;
  feedback?: Feedback;
}) {
  const domain = DOMAINS.find(d => d.id === interview.domain);
  const href   = interview.status === 'completed'
    ? `/interview/${interview.id}/feedback`
    : `/interview/${interview.id}`;

  const scoreColor = feedback
    ? feedback.overallScore >= 75 ? 'text-success' : feedback.overallScore >= 50 ? 'text-warning' : 'text-danger'
    : '';

  const verdictBadge: Record<string, string> = {
    'Strong Hire': 'badge-success',
    'Hire':        'badge-success',
    'Maybe':       'badge-warning',
    'No Hire':     'badge-danger',
  };

  return (
    <Link href={href} className="card-hover block p-5">
      {/* Domain + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${domain?.color}15` }}
          >
            {interview.domainIcon}
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{interview.domainLabel}</p>
            <p className="text-xs text-ink-muted capitalize">{interview.difficulty} level</p>
          </div>
        </div>

        {interview.status === 'completed' ? (
          <CheckCircle size={16} className="text-success mt-0.5" />
        ) : (
          <Clock size={16} className="text-ink-muted mt-0.5" />
        )}
      </div>

      {/* Score / verdict */}
      {feedback ? (
        <div className="flex items-center justify-between mb-3">
          <span className={`text-2xl font-bold ${scoreColor}`}>
            {feedback.overallScore}<span className="text-sm font-normal text-ink-muted">/100</span>
          </span>
          <span className={`badge ${verdictBadge[feedback.verdict] ?? 'badge-brand'}`}>
            {feedback.verdict}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <Mic size={14} className="text-brand-500" />
          <span className="text-sm text-ink-secondary">
            {interview.status === 'pending' ? 'Ready to start' : 'In progress'}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100">
        <span className="text-xs text-ink-muted">
          {dayjs(interview.createdAt).fromNow()}
        </span>
        <ChevronRight size={15} className="text-ink-muted" />
      </div>
    </Link>
  );
}
