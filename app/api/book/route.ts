import { NextRequest, NextResponse } from 'next/server';
import { bookSlot, getSubmissionById, getSlots } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, submissionId } = body;

    if (!slotId || !submissionId) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // Verify submission exists
    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: '제출 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Verify slot is available
    const slots = await getSlots();
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) {
      return NextResponse.json({ error: '해당 슬롯을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (slot.available !== 'true') {
      return NextResponse.json({ error: '이미 예약된 슬롯입니다.' }, { status: 409 });
    }

    const bookingId = await bookSlot(slotId, submissionId, {
      brandName: submission.brandName,
      contactName: submission.contactName,
      email: submission.email,
      date: slot.date,
      time: slot.time,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      date: slot.date,
      time: slot.time,
      brandName: submission.brandName,
      contactName: submission.contactName,
    });
  } catch (error) {
    console.error('Book error:', error);
    return NextResponse.json({ error: '예약 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
