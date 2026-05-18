'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Slot } from '@/lib/googleSheets';

function ScheduleContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    date: string;
    time: string;
    brandName: string;
    contactName: string;
    bookingId: string;
  } | null>(null);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/slots');
        const data = await res.json();
        if (res.ok) {
          setSlots(data.slots || []);
        } else {
          setError(data.error || '슬롯 정보를 불러올 수 없습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, []);

  // Get dates with available slots
  const availableDates = new Set(slots.map((s) => s.date));

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function formatDate(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function getSlotsForDate(date: string) {
    return slots.filter((s) => s.date === date);
  }

  function formatDisplayDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }

  async function handleBook() {
    if (!selectedSlot || !submissionId) return;
    setBooking(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, submissionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '예약 중 오류가 발생했습니다.');
        return;
      }

      setBookingResult(data);
      setBooked(true);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setBooking(false);
    }
  }

  const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const MONTHS_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  if (booked && bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">미팅이 확정되었습니다!</h2>
          <p className="text-gray-500 mb-6">
            {bookingResult.contactName}님, 미팅 예약이 완료되었습니다.
          </p>
          <div className="bg-indigo-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">브랜드</span>
              <span className="text-sm font-medium text-gray-900">{bookingResult.brandName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">담당자</span>
              <span className="text-sm font-medium text-gray-900">{bookingResult.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">미팅 일자</span>
              <span className="text-sm font-medium text-gray-900">{formatDisplayDate(bookingResult.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">미팅 시간</span>
              <span className="text-sm font-medium text-gray-900">{bookingResult.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">예약 번호</span>
              <span className="text-xs font-mono text-gray-500">{bookingResult.bookingId}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            미팅 관련 문의는 Y-TRIBE 팀에 연락해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">YT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Y-TRIBE</h1>
            <p className="text-xs text-gray-500">미팅 일정 선택</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">미팅 일정을 선택해 주세요</h2>
          <p className="text-gray-500 text-sm">제안서 검토 후 미팅 가능한 날짜와 시간을 선택해 주세요.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>일정을 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-bold text-gray-900">
                  {year}년 {MONTHS_KO[month]}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DAYS_KO.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDate(year, month, day);
                  const hasSlots = availableDates.has(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const today = new Date();
                  const isPast = new Date(dateStr) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (hasSlots && !isPast) {
                          setSelectedDate(dateStr);
                          setSelectedSlot(null);
                        }
                      }}
                      disabled={!hasSlots || isPast}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : hasSlots && !isPast
                          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {day}
                      {hasSlots && !isPast && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-indigo-50 border border-indigo-200" />
                  <span>예약 가능</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-indigo-600" />
                  <span>선택됨</span>
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {!selectedDate ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-8">
                  <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">왼쪽 캘린더에서 날짜를 선택해 주세요</p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 mb-1">{formatDisplayDate(selectedDate)}</h3>
                  <p className="text-sm text-gray-500 mb-4">가능한 시간대를 선택해 주세요</p>

                  <div className="space-y-2 mb-6">
                    {getSlotsForDate(selectedDate).map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                          selectedSlot?.id === slot.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{slot.time}</span>
                          {selectedSlot?.id === slot.id && (
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={!selectedSlot || booking || !submissionId}
                    className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {booking ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        예약 중...
                      </>
                    ) : (
                      '미팅 예약하기'
                    )}
                  </button>

                  {!submissionId && (
                    <p className="mt-2 text-xs text-center text-red-500">
                      제출 ID가 없습니다. 폼을 다시 제출해 주세요.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!loading && slots.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-700 mb-2">현재 예약 가능한 슬롯이 없습니다</h3>
            <p className="text-sm text-gray-400">
              Y-TRIBE 팀이 곧 미팅 슬롯을 추가할 예정입니다. <br />
              빠른 문의는 직접 연락해 주세요.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ScheduleContent />
    </Suspense>
  );
}
