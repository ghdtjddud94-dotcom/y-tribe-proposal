'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission, Slot } from '@/lib/googleSheets';

type Tab = 'submissions' | 'slots';

function formatDate(isoStr: string) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    '미팅 예정': 'bg-yellow-100 text-yellow-700',
    '미팅 확정': 'bg-green-100 text-green-700',
    '미팅 완료': 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || '-'}
    </span>
  );
}

function SubmissionDetail({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  const fields = [
    { label: '브랜드명', value: submission.brandName },
    { label: '담당자명', value: submission.contactName },
    { label: '이메일', value: submission.email },
    { label: '전화번호', value: submission.phone },
    { label: '소재지', value: submission.location },
    { label: '카카오톡', value: submission.kakao },
    { label: '현재 광고현황', value: submission.currentAds },
    { label: '효율 좋은 광고', value: submission.bestAds },
    { label: '주력 제품/매장', value: submission.keyProduct },
    { label: '주요 판매처', value: submission.salesChannel },
    { label: '프로모션', value: submission.promotions },
    { label: '마케팅 목표', value: submission.marketingGoals },
    { label: '캠페인 시작일', value: submission.campaignStart },
    { label: '캠페인 종료일', value: submission.campaignEnd },
    { label: '마케팅 예산', value: submission.budget },
    { label: '제품 URL', value: submission.productUrl },
    { label: '캠페인 배경', value: submission.campaignBackground },
    { label: '제안 요청사항', value: submission.proposalRequirements },
    { label: '타겟 정보', value: submission.targetInfo },
    { label: '경쟁사', value: submission.competitors },
    { label: '브랜드 차별성', value: submission.brandDiff },
    { label: '바이럴 에셋 활용', value: submission.viralAssetsAvailable },
    { label: '바이럴 에셋 상세', value: submission.viralAssets },
    { label: '기타 의견', value: submission.otherNotes },
    { label: '미팅 상태', value: submission.meetingStatus },
    { label: '미팅 슬롯 ID', value: submission.meetingSlotId },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{submission.brandName}</h3>
            <p className="text-sm text-gray-500">{formatDate(submission.timestamp)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {fields.map(({ label, value }) => (
            value ? (
              <div key={label} className="grid grid-cols-3 gap-4">
                <span className="text-sm text-gray-500 col-span-1">{label}</span>
                <span className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap">{value}</span>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [slotSuccess, setSlotSuccess] = useState('');
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      // ignore
    } finally {
      setLoadingSubmissions(false);
    }
  }, [router]);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/slots');
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      // ignore
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    fetchSlots();
  }, [fetchSubmissions, fetchSlots]);

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  async function handleAddSlot() {
    if (!newSlotDate || !newSlotTime) {
      setSlotError('날짜와 시간을 모두 입력해 주세요.');
      return;
    }
    setAddingSlot(true);
    setSlotError('');
    setSlotSuccess('');

    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newSlotDate, time: newSlotTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSlotError(data.error || '슬롯 추가 중 오류가 발생했습니다.');
        return;
      }
      setSlotSuccess('슬롯이 추가되었습니다.');
      setNewSlotDate('');
      setNewSlotTime('');
      await fetchSlots();
    } catch {
      setSlotError('네트워크 오류가 발생했습니다.');
    } finally {
      setAddingSlot(false);
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm('이 슬롯을 삭제하시겠습니까?')) return;
    setDeletingSlot(id);
    try {
      const res = await fetch(`/api/admin/slots/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSlots();
      }
    } catch {
      // ignore
    } finally {
      setDeletingSlot(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YT</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Y-TRIBE</h1>
              <p className="text-xs text-gray-500">어드민 대시보드</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">전체 제출</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">미팅 확정</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {submissions.filter((s) => s.meetingStatus === '미팅 확정').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">미팅 예정</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {submissions.filter((s) => s.meetingStatus === '미팅 예정' || !s.meetingStatus).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">가용 슬롯</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {slots.filter((s) => s.available === 'true').length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setTab('submissions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'submissions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            제출 목록
          </button>
          <button
            onClick={() => setTab('slots')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'slots' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            미팅 슬롯 관리
          </button>
        </div>

        {/* Submissions Tab */}
        {tab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loadingSubmissions ? (
              <div className="p-12 text-center text-gray-400">
                <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                로딩 중...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p>아직 제출된 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">브랜드명</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">담당자</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">이메일</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">제출일</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">미팅 상태</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.brandName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.contactName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.timestamp)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.meetingStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedSubmission(s)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            상세 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Slots Tab */}
        {tab === 'slots' && (
          <div className="space-y-6">
            {/* Add slot form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">새 미팅 슬롯 추가</h3>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">날짜</label>
                  <input
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => { setNewSlotDate(e.target.value); setSlotError(''); setSlotSuccess(''); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시간</label>
                  <input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => { setNewSlotTime(e.target.value); setSlotError(''); setSlotSuccess(''); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleAddSlot}
                  disabled={addingSlot}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {addingSlot ? '추가 중...' : '슬롯 추가'}
                </button>
              </div>
              {slotError && <p className="mt-2 text-sm text-red-600">{slotError}</p>}
              {slotSuccess && <p className="mt-2 text-sm text-green-600">{slotSuccess}</p>}
            </div>

            {/* Slots list */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">등록된 슬롯</h3>
              </div>
              {loadingSlots ? (
                <div className="p-8 text-center text-gray-400">로딩 중...</div>
              ) : slots.filter((s) => s.id).length === 0 ? (
                <div className="p-8 text-center text-gray-400">등록된 슬롯이 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">날짜</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">시간</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">상태</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">예약자</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.filter((s) => s.id).sort((a, b) => {
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.time.localeCompare(b.time);
                      }).map((slot) => (
                        <tr key={slot.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(slot.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{slot.time}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              slot.available === 'true'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {slot.available === 'true' ? '예약 가능' : '예약됨'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{slot.bookedBy || '-'}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={deletingSlot === slot.id}
                              className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              {deletingSlot === slot.id ? '삭제 중...' : '삭제'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Submission detail modal */}
      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
