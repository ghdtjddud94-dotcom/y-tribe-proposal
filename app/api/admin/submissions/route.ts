import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/googleSheets';

export async function GET() {
  try {
    const submissions = await getSubmissions();
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Admin submissions error:', error);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
