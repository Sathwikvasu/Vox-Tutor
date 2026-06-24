'use server';

import { adminDb, adminAuth } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { Interview, Feedback, User } from '@/types';

// ─── Session ────────────────────────────────────────────────────────────────

export async function createSession(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
  const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
  cookies().set('voxtutor-session', sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function revokeSession() {
  cookies().delete('voxtutor-session');
}

export async function getCurrentUser(): Promise<User | null> {
  const session = cookies().get('voxtutor-session')?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(session, true);
    const doc = await adminDb().collection('users').doc(decoded.uid).get();
    if (!doc.exists) return null;
    return { uid: decoded.uid, ...doc.data() } as User;
  } catch {
    return null;
  }
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: Omit<User, 'createdAt'>) {
  const ref = adminDb().collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ ...user, createdAt: new Date().toISOString() });
  } else {
    await ref.update({ name: user.name, email: user.email, photoURL: user.photoURL ?? '' });
  }
}

// ─── Interviews ───────────────────────────────────────────────────────────────

export async function createInterview(data: Omit<Interview, 'id' | 'createdAt' | 'status' | 'transcript'>) {
  const ref = adminDb().collection('interviews').doc();
  const interview: Interview = {
    ...data,
    id: ref.id,
    status: 'pending',
    transcript: [],
    createdAt: new Date().toISOString(),
  };
  await ref.set(interview);
  return interview;
}

export async function getInterview(id: string): Promise<Interview | null> {
  const doc = await adminDb().collection('interviews').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Interview;
}

export async function getUserInterviews(userId: string): Promise<Interview[]> {
  const snap = await adminDb()
    .collection('interviews')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Interview));
}

export async function updateInterviewStatus(
  id: string,
  status: Interview['status'],
  extra?: Partial<Interview>
) {
  await adminDb().collection('interviews').doc(id).update({ status, ...extra });
}

export async function appendTranscript(id: string, entry: Interview['transcript'][number]) {
  const { FieldValue } = await import('firebase-admin/firestore');
  await adminDb().collection('interviews').doc(id).update({
    transcript: FieldValue.arrayUnion(entry),
  });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>) {
  const ref = adminDb().collection('feedback').doc();
  const doc: Feedback = {
    ...feedback,
    id: ref.id,
    createdAt: new Date().toISOString(),
  };
  await ref.set(doc);
  return doc;
}

export async function getFeedback(interviewId: string): Promise<Feedback | null> {
  const snap = await adminDb()
    .collection('feedback')
    .where('interviewId', '==', interviewId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Feedback;
}

export async function getUserFeedbacks(userId: string): Promise<Feedback[]> {
  const snap = await adminDb()
    .collection('feedback')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
}
