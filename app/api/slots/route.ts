import { NextResponse } from 'next/server';
import { getSlots } from '@/lib/googleSheets';

export async function GET() {
  try {
    const slots = await getSlots();
    // Only return available slots
    const available = slots.filter((s) => s.available === 'true' && s.id);
    return NextResponse.json({ slots: available });
  } catch (error) {
    console.error('Slots fetch error:', error);
    return NextResponse.json({ error: '슬롯 정보를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
