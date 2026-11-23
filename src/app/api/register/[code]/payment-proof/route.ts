import { NextResponse } from 'next/server';

/** Screenshot collection is disabled in the current privacy-minimal registration flow. */
export async function POST() {
  return NextResponse.json(
    { error: 'Payment screenshots are no longer collected. Use the UPI reference entered during registration.' },
    { status: 410 }
  );
}
