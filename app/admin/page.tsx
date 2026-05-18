'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission } from '@/lib/googleSheets';

type Tab = 'submissions' | 'calendar';

function formatDate(isoStr: string) {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
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

function SubmissionDetail({
  submission,
  onClose,
  onSaved,
}: {
  submission: Submission;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [meetingDate, setMeetingDate] = useState(submission.meetingDate || submission.preferredDate || '');
  const [meetingTime, setMeetingTime] = useState(submission.meetingTime || submission.preferredTime || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function handleSaveMeeting() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingDate, meetingTime }),
      });
      if (res.ok) {
        setSaveMsg('저장되었습니다.');
        onSaved();
      } else {
        setSaveMsg('저장 중 오류가 발생했습니다.');
      }
    } catch {
      setSaveMsg('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

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
    { label: '캠페인 기간', value: submission.campaignStart && submission.campaignEnd ? `${submission.campaignStart} ~ ${submission.campaignEnd}` : '' },
    { label: '마케팅 예산', value: submission.budget },
    { label: '제품 URL', value: submission.productUrl },
    { label: '캠페인 배경', value: submission.campaignBackground },
    { label: '제안 요청사항', value: submission.proposalRequirements },
    { label: '타겟 정보', value: submission.targetInfo },
    { label: '경쟁사', value: submission.competitors },
    { label: '브랜드 차별성', value: submission.brandDiff },
    { label: '바이럴 에셋 활용', value: submission.viralAssetsAvailable },
    { label: '바이럴 에셋 상세', value: submission.viralAssets },
    { label: '에셋 링크', value: submission.viralAssetsLink },
    { label: '기타 의견', value: submission.otherNotes },
    { label: '희망 미팅 날짜', value: submission.preferredDate },
    { label: '희망 미팅 시간', value: submission.preferredTime },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{submission.brandName}</h3>
            <p className="text-sm text-gray-500">{formatDate(submission.timestamp)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {fields.map(({ label, value }) =>
            value ? (
              <div key={label} className="grid grid-cols-3 gap-4">
                <span className="text-sm text-gray-500 col-span-1">{label}</span>
                <span className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap break-all">{value}</span>
              </div>
            ) : null
          )}
        </div>

        {/* 미팅 일정 확정 */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl space-y-4">
          {/* 희망 일정 */}
          {(submission.preferredDate || submission.preferredTime) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-amber-700 mb-1">브랜드 희망 미팅 일정</p>
              <p className="text-sm font-semibold text-amber-900">
                {submission.preferredDate} {submission.preferredTime}
              </p>
            </div>
          )}

          {/* 확정 입력 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              {submission.meetingStatus === '미팅 확정' ? '미팅 확정일 수정' : '미팅 일정 확정'}
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">날짜</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">시간</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleSaveMeeting}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : submission.meetingStatus === '미팅 확정' ? '수정' : '확정'}
              </button>
            </div>
            {saveMsg && (
              <p className={`mt-2 text-sm ${saveMsg.includes('오류') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ submissions }: { submissions: Submission[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const confirmed = submissions.filter((s) => s.meetingDate);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function getMeetings(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return confirmed.filter((s) => s.meetingDate === dateStr);
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-bold text-gray-900">{year}년 {monthNames[month]}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const meetings = day ? getMeetings(day) : [];
          return (
            <div
              key={i}
              className={`min-h-[80px] p-1.5 border-b border-r border-gray-50 ${!day ? 'bg-gray-50/50' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday(day) ? 'bg-indigo-600 text-white' : 'text-gray-600'
                  }`}>
                    {day}
                  </span>
                  {meetings.map((m) => (
                    <div key={m.id} className="bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mb-0.5">
                      <p className="text-xs font-medium text-indigo-700 truncate">{m.brandName}</p>
                      {m.meetingTime && <p className="text-xs text-indigo-400">{m.meetingTime}</p>}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

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
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-3 gap-4 mb-6">
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
            <p className="text-xs text-gray-500">검토 중</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {submissions.filter((s) => s.meetingStatus !== '미팅 확정').length}
            </p>
          </div>
        </div>

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
            onClick={() => setTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            미팅 캘린더
          </button>
        </div>

        {tab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                로딩 중...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-gray-400">아직 제출된 데이터가 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">브랜드명</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">담당자</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">연락처</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">제출일</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">미팅 확정일</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">상태</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.brandName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.contactName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.phone}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.timestamp)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {s.meetingDate ? `${s.meetingDate} ${s.meetingTime}` : '-'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={s.meetingStatus} /></td>
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

        {tab === 'calendar' && <CalendarView submissions={submissions} />}
      </main>

      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSaved={fetchSubmissions}
        />
      )}
    </div>
  );
}
