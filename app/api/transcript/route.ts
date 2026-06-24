import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { interviewId, entry } = await req.json();

    if (!interviewId || !entry) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Append entry to interview transcript array in Firestore atomically
    await adminDb().collection('interviews').doc(interviewId).update({
      transcript: FieldValue.arrayUnion(entry),
      status: 'active',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Transcript save error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
