import { NextRequest, NextResponse } from 'next/server';
import { getSlots, addSlot } from '@/lib/googleSheets';

export async function GET() {
  try {
    const slots = await getSlots();
    return NextResponse.json({ slots: slots.filter((s) => s.id) });
  } catch (error) {
    console.error('Admin slots GET error:', error);
    return NextResponse.json({ error: '슬롯 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json({ error: '날짜와 시간을 입력해 주세요.' }, { status: 400 });
    }

    const id = await addSlot(date, time);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin slots POST error:', error);
    return NextResponse.json({ error: '슬롯 추가 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
