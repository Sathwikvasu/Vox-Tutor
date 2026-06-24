import { getCurrentUser, getUserInterviews, getUserFeedbacks } from '@/lib/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Plus, Mic, CheckCircle, Clock, ChevronRight, BarChart2 } from 'lucide-react';
import { Interview, Feedback } from '@/types';
import NewInterviewButton from '@/components/dashboard/NewInterviewButton';
import InterviewCard from '@/components/dashboard/InterviewCard';

dayjs.extend(relativeTime);

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const [interviews, feedbacks] = await Promise.all([
    getUserInterviews(user.uid),
    getUserFeedbacks(user.uid),
  ]);

  const completed  = interviews.filter(i => i.status === 'completed').length;
  const avgScore   = feedbacks.length
    ? Math.round(feedbacks.reduce((s, f) => s + f.overallScore, 0) / feedbacks.length)
    : null;
  const feedbackMap = Object.fromEntries(feedbacks.map(f => [f.interviewId, f]));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-ink-secondary text-sm mt-1">
            {interviews.length === 0
              ? 'Start your first mock interview below.'
              : `You've completed ${completed} interview${completed !== 1 ? 's' : ''}.`}
          </p>
        </div>
        <NewInterviewButton userId={user.uid} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total sessions', value: interviews.length, icon: Mic },
          { label: 'Completed', value: completed, icon: CheckCircle },
          { label: 'Avg score', value: avgScore ? `${avgScore}/100` : '—', icon: BarChart2 },
          { label: 'Domains practiced', value: new Set(interviews.map(i => i.domain)).size, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">{label}</p>
              <Icon size={15} className="text-brand-400" />
            </div>
            <p className="text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Interviews list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-ink">Your interviews</h2>
      </div>

      {interviews.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Mic size={28} className="text-brand-500" />
          </div>
          <h3 className="font-semibold text-ink mb-2">No interviews yet</h3>
          <p className="text-sm text-ink-secondary mb-6 max-w-xs mx-auto">
            Pick a domain, set your level, and start your first AI voice interview.
          </p>
          <NewInterviewButton userId={user.uid} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews.map(interview => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              feedback={feedbackMap[interview.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
