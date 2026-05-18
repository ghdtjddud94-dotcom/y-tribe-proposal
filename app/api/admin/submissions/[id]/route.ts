import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/googleSheets';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await getSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ error: '제출 정보를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Submission fetch error:', error);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
