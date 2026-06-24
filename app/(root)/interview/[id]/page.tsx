import { getCurrentUser, getInterview } from '@/lib/actions';
import { redirect } from 'next/navigation';
import InterviewPageClient from '@/components/interview/InterviewPageClient';

export default async function InterviewPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const interview = await getInterview(params.id);
  if (!interview || interview.userId !== user.uid) redirect('/dashboard');
  if (interview.status === 'completed') redirect(`/interview/${params.id}/feedback`);

  // Questions always loaded from Firestore — no URL param fragility
  const questions = interview.questions ?? [];
  if (!questions.length) redirect('/dashboard');

  return (
    <InterviewPageClient
      interviewId={interview.id}
      userId={user.uid}
      questions={questions}
      domainId={interview.domain}
      difficulty={interview.difficulty}
      duration={interview.duration}
    />
  );
}
