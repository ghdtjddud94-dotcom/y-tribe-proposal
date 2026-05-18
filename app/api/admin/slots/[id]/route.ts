import { NextRequest, NextResponse } from 'next/server';
import { deleteSlot } from '@/lib/googleSheets';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSlot(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin slot DELETE error:', error);
    return NextResponse.json({ error: '슬롯 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
