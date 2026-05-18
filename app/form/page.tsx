'use client';

import { useState } from 'react';
import StepIndicator from '@/components/StepIndicator';
import FormField from '@/components/FormField';
import type { FormData } from '@/lib/types';

const STEPS = [
  { number: 1, label: '기본 정보' },
  { number: 2, label: '마케팅 현황' },
  { number: 3, label: '제안 요청서' },
];

const MARKETING_GOALS = ['브랜딩', '킬러제품 노출', '신규소비자 유입', '구매전환'];
const SALES_CHANNELS = ['공식몰', '스마트스토어', '기타'];

const initialForm: FormData = {
  brandName: '',
  contactName: '',
  email: '',
  phone: '',
  location: '',
  kakao: '',
  currentAds: '',
  bestAds: '',
  keyProduct: '',
  salesChannel: '',
  salesChannelOther: '',
  promotions: '',
  marketingGoals: [],
  campaignStart: '',
  campaignEnd: '',
  budget: '',
  productUrl: '',
  campaignBackground: '',
  proposalRequirements: '',
  targetInfo: '',
  competitors: '',
  brandDiff: '',
  viralAssetsAvailable: '',
  viralAssets: '',
  viralAssetsLink: '',
  otherNotes: '',
};

type Errors = Partial<Record<keyof FormData, string>>;

function inputClass(error?: string) {
  return `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;
}

function textareaClass(error?: string) {
  return `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;
}

export default function FormPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function toggleGoal(goal: string) {
    const goals = form.marketingGoals.includes(goal)
      ? form.marketingGoals.filter((g) => g !== goal)
      : [...form.marketingGoals, goal];
    update('marketingGoals', goals);
  }

  function validateStep1(): Errors {
    const e: Errors = {};
    if (!form.brandName.trim()) e.brandName = '브랜드명을 입력해 주세요.';
    if (!form.contactName.trim()) e.contactName = '담당자명을 입력해 주세요.';
    if (!form.email.trim()) {
      e.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = '올바른 이메일 형식을 입력해 주세요.';
    }
    if (!form.phone.trim()) e.phone = '전화번호를 입력해 주세요.';
    return e;
  }

  function validateStep2(): Errors {
    return {};
  }

  function validateStep3(): Errors {
    return {};
  }

  function handleNext() {
    let errs: Errors = {};
    if (step === 1) errs = validateStep1();
    else if (step === 2) errs = validateStep2();
    else if (step === 3) errs = validateStep3();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstError = Object.values(errs)[0];
      setServerError(firstError || '');
      return;
    }
    setErrors({});
    setServerError('');
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
    setServerError('');
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || '제출 중 오류가 발생했습니다.');
        return;
      }

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch {
      setServerError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">제출이 완료되었습니다</h2>
          <p className="text-gray-500 leading-relaxed">
            소중한 내용 잘 받았습니다.<br />
            담당자가 검토 후 <span className="font-medium text-gray-700">개별 연락</span>을 통해<br />
            미팅 일정을 조율해 드릴 예정입니다.
          </p>
          <p className="mt-4 text-sm text-gray-400">감사합니다 🙏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">YT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Y-TRIBE</h1>
            <p className="text-xs text-gray-500">브랜드 제안 요청서</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <StepIndicator steps={STEPS} currentStep={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">기본 정보</h2>
              <p className="text-sm text-gray-500 mb-6">브랜드 및 담당자 기본 정보를 입력해 주세요.</p>

              <FormField label="브랜드명" required error={errors.brandName}>
                <input
                  type="text"
                  value={form.brandName}
                  onChange={(e) => update('brandName', e.target.value)}
                  placeholder="브랜드명을 입력해 주세요"
                  className={inputClass(errors.brandName)}
                />
              </FormField>

              <FormField label="담당자명" required error={errors.contactName}>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => update('contactName', e.target.value)}
                  placeholder="담당자 성함을 입력해 주세요"
                  className={inputClass(errors.contactName)}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="이메일" required error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="example@company.com"
                    className={inputClass(errors.email)}
                  />
                </FormField>

                <FormField label="전화번호" required error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="010-0000-0000"
                    className={inputClass(errors.phone)}
                  />
                </FormField>
              </div>

              <FormField label="소재지" hint="브랜드/사무실 위치를 입력해 주세요">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="서울시 강남구"
                  className={inputClass()}
                />
              </FormField>

              <FormField label="카카오톡 연락처" hint="카카오톡 ID 또는 오픈채팅 링크">
                <input
                  type="text"
                  value={form.kakao}
                  onChange={(e) => update('kakao', e.target.value)}
                  placeholder="카카오톡 ID 또는 오픈채팅 링크"
                  className={inputClass()}
                />
              </FormField>
            </div>
          )}

          {/* Step 2: 마케팅 현황 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">마케팅 현황</h2>
              <p className="text-sm text-gray-500 mb-6">현재 마케팅 상황과 목표를 알려주세요.</p>

              <FormField label="현재 진행 중인 광고현황">
                <textarea
                  rows={3}
                  value={form.currentAds}
                  onChange={(e) => update('currentAds', e.target.value)}
                  placeholder="현재 진행 중인 광고 채널, 예산, 성과 등을 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="가장 효율이 좋았던 광고">
                <textarea
                  rows={3}
                  value={form.bestAds}
                  onChange={(e) => update('bestAds', e.target.value)}
                  placeholder="가장 효과적이었던 광고 캠페인이나 채널을 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="주력 제품/매장">
                <textarea
                  rows={2}
                  value={form.keyProduct}
                  onChange={(e) => update('keyProduct', e.target.value)}
                  placeholder="주요 제품 또는 매장 정보를 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="주요 판매처">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-3">
                    {SALES_CHANNELS.map((channel) => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salesChannel"
                          value={channel}
                          checked={form.salesChannel === channel}
                          onChange={(e) => update('salesChannel', e.target.value)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{channel}</span>
                      </label>
                    ))}
                  </div>
                  {form.salesChannel === '기타' && (
                    <input
                      type="text"
                      value={form.salesChannelOther}
                      onChange={(e) => update('salesChannelOther', e.target.value)}
                      placeholder="판매처를 직접 입력해 주세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  )}
                </div>
              </FormField>

              <FormField label="진행 중이거나 예정된 프로모션">
                <textarea
                  rows={3}
                  value={form.promotions}
                  onChange={(e) => update('promotions', e.target.value)}
                  placeholder="현재 진행 중이거나 예정된 프로모션을 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="마케팅 목표" hint="해당하는 목표를 모두 선택해 주세요">
                <div className="flex flex-wrap gap-3">
                  {MARKETING_GOALS.map((goal) => (
                    <label
                      key={goal}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer transition-colors text-sm font-medium ${
                        form.marketingGoals.includes(goal)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.marketingGoals.includes(goal)}
                        onChange={() => toggleGoal(goal)}
                        className="sr-only"
                      />
                      {form.marketingGoals.includes(goal) && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {goal}
                    </label>
                  ))}
                </div>
              </FormField>
            </div>
          )}

          {/* Step 3: 제안 요청서 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">제안 요청서</h2>
              <p className="text-sm text-gray-500 mb-6">캠페인 제안을 위한 상세 정보를 입력해 주세요.</p>

              <FormField label="캠페인 기간">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">시작일</label>
                    <input
                      type="date"
                      value={form.campaignStart}
                      onChange={(e) => update('campaignStart', e.target.value)}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">종료일</label>
                    <input
                      type="date"
                      value={form.campaignEnd}
                      onChange={(e) => update('campaignEnd', e.target.value)}
                      className={inputClass()}
                    />
                  </div>
                </div>
              </FormField>

              <FormField label="마케팅 예산" hint="월별 또는 총 예산을 입력해 주세요">
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => update('budget', e.target.value)}
                  placeholder="예: 월 500만원 / 총 3,000만원"
                  className={inputClass()}
                />
              </FormField>

              <FormField label="마케팅 제품(서비스) URL">
                <input
                  type="url"
                  value={form.productUrl}
                  onChange={(e) => update('productUrl', e.target.value)}
                  placeholder="https://..."
                  className={inputClass()}
                />
              </FormField>

              <FormField label="캠페인 배경 및 문제인식">
                <textarea
                  rows={4}
                  value={form.campaignBackground}
                  onChange={(e) => update('campaignBackground', e.target.value)}
                  placeholder="캠페인을 진행하게 된 배경과 해결하고자 하는 문제를 설명해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="제안 요청사항" hint="요청 업무, 범위, 필수 캠페인 등">
                <textarea
                  rows={4}
                  value={form.proposalRequirements}
                  onChange={(e) => update('proposalRequirements', e.target.value)}
                  placeholder="원하시는 마케팅 업무, 범위, 필수적으로 포함되어야 할 캠페인 등을 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="타겟 정보 및 시장 현황">
                <textarea
                  rows={3}
                  value={form.targetInfo}
                  onChange={(e) => update('targetInfo', e.target.value)}
                  placeholder="주요 타겟 고객층과 시장 상황을 설명해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="경쟁사">
                <input
                  type="text"
                  value={form.competitors}
                  onChange={(e) => update('competitors', e.target.value)}
                  placeholder="주요 경쟁사를 입력해 주세요 (쉼표로 구분)"
                  className={inputClass()}
                />
              </FormField>

              <FormField label="브랜드 차별성">
                <textarea
                  rows={3}
                  value={form.brandDiff}
                  onChange={(e) => update('brandDiff', e.target.value)}
                  placeholder="경쟁사 대비 브랜드의 차별화 포인트를 설명해 주세요"
                  className={textareaClass()}
                />
              </FormField>

              <FormField label="보유 바이럴 에셋 2차 활용 가능 여부">
                <div className="space-y-3">
                  <div className="flex gap-6">
                    {['가능', '불가능'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="viralAssetsAvailable"
                          value={opt}
                          checked={form.viralAssetsAvailable === opt}
                          onChange={(e) => update('viralAssetsAvailable', e.target.value)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {form.viralAssetsAvailable === '가능' && (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={form.viralAssets}
                        onChange={(e) => update('viralAssets', e.target.value)}
                        placeholder="보유하신 바이럴 에셋에 대해 상세히 설명해 주세요"
                        className={textareaClass()}
                      />
                      <input
                        type="url"
                        value={form.viralAssetsLink}
                        onChange={(e) => update('viralAssetsLink', e.target.value)}
                        placeholder="드롭박스 또는 구글 드라이브 링크를 입력해 주세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="기타 의견/예산/희망 캠페인">
                <textarea
                  rows={3}
                  value={form.otherNotes}
                  onChange={(e) => update('otherNotes', e.target.value)}
                  placeholder="추가로 전달하고 싶은 내용을 자유롭게 입력해 주세요"
                  className={textareaClass()}
                />
              </FormField>
            </div>
          )}

          {/* Error message */}
          {serverError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                이전
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    제출 중...
                  </>
                ) : (
                  '제출하기'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex justify-center">
          <p className="text-xs text-gray-400">
            {step} / {STEPS.length} 단계
          </p>
        </div>
      </main>
    </div>
  );
}
