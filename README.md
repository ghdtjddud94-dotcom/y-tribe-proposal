# YT Marketing - 브랜드 제안 요청서 플랫폼

YT Marketing의 브랜드 제안 요청서 접수 및 미팅 예약 관리 웹 애플리케이션입니다.

## 기능

- **3단계 브랜드 제안 요청서 폼** - 기본 정보 → 마케팅 현황 → 제안 요청서
- **미팅 일정 선택** - 제출 후 캘린더에서 가능한 시간대 예약
- **어드민 대시보드** - 제출 목록 조회, 미팅 슬롯 관리
- **Google Sheets 연동** - 모든 데이터가 구글 시트에 저장

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Google Sheets API (googleapis)

---

## 초기 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repo-url>
cd proposal-web
npm install
```

### 2. 환경변수 설정

`.env.local.example` 파일을 복사하여 `.env.local`을 생성하고 값을 채워넣습니다.

```bash
cp .env.local.example .env.local
```

```env
ADMIN_PASSWORD=yourpassword
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Google Sheets 설정

#### 3-1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 사용)
3. **Google Sheets API** 활성화:
   - APIs & Services > Library > "Google Sheets API" 검색 → Enable

#### 3-2. 서비스 계정 생성

1. APIs & Services > Credentials > Create Credentials > Service Account
2. 이름 입력 후 생성
3. 생성된 서비스 계정 클릭 → Keys 탭 → Add Key → JSON 다운로드
4. JSON 파일에서 다음 값을 `.env.local`에 복사:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (전체 값 복사, `\n`은 그대로 유지)

#### 3-3. Google Spreadsheet 생성 및 공유

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. URL에서 스프레드시트 ID 복사 (`.../spreadsheets/d/{ID}/...`) → `GOOGLE_SHEETS_ID`
3. 스프레드시트를 서비스 계정 이메일에 **편집자** 권한으로 공유

#### 3-4. 시트 구조 설정

스프레드시트 내에 다음 3개의 시트를 생성하고, **첫 번째 행에 헤더를 입력**합니다.

**시트 1: `submissions`**

열 순서 (A~AB):
id, timestamp, brandName, contactName, email, phone, location, kakao, currentAds, bestAds, keyProduct, salesChannel, promotions, marketingGoals, campaignStart, campaignEnd, budget, productUrl, campaignBackground, proposalRequirements, targetInfo, competitors, brandDiff, viralAssetsAvailable, viralAssets, otherNotes, meetingStatus, meetingSlotId

**시트 2: `slots`**

열 순서 (A~F):
id, date, time, available, bookedBy, bookedSubmissionId

**시트 3: `bookings`**

열 순서 (A~I):
id, submissionId, slotId, date, time, brandName, contactName, email, bookedAt

---

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 자동으로 `/form`으로 리다이렉트됩니다.

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | `/form`으로 리다이렉트 |
| `/form` | 3단계 브랜드 제안 요청서 폼 |
| `/schedule?id={submissionId}` | 미팅 일정 선택 캘린더 |
| `/admin` | 어드민 대시보드 (인증 필요) |
| `/admin/login` | 어드민 로그인 |

---

## 어드민 사용법

1. `/admin/login`에서 `ADMIN_PASSWORD` 환경변수에 설정한 비밀번호로 로그인
2. **제출 목록 탭**: 모든 제출 데이터 열람, 상세 보기 가능
3. **미팅 슬롯 관리 탭**: 미팅 가능한 날짜/시간 추가/삭제

---

## 배포 (Vercel)

```bash
npx vercel
```

또는 Vercel 대시보드에서 GitHub 저장소 연결 후 환경변수를 설정합니다.

---

## 프로젝트 구조

```
proposal-web/
├── app/
│   ├── form/page.tsx                      # 3단계 제안 요청서 폼
│   ├── schedule/page.tsx                  # 미팅 일정 선택 페이지
│   ├── admin/
│   │   ├── page.tsx                       # 어드민 대시보드
│   │   └── login/page.tsx                 # 어드민 로그인
│   └── api/
│       ├── submit/route.ts                # 폼 제출 API
│       ├── slots/route.ts                 # 공개 슬롯 조회 API
│       ├── book/route.ts                  # 미팅 예약 API
│       └── admin/
│           ├── login/route.ts             # 어드민 로그인/로그아웃
│           ├── submissions/route.ts       # 전체 제출 목록
│           ├── submissions/[id]/route.ts  # 단일 제출 조회
│           ├── slots/route.ts             # 슬롯 목록/추가
│           └── slots/[id]/route.ts        # 슬롯 삭제
├── components/
│   ├── StepIndicator.tsx                  # 폼 단계 표시 컴포넌트
│   └── FormField.tsx                      # 폼 필드 래퍼 컴포넌트
├── lib/
│   ├── googleSheets.ts                    # Google Sheets API 래퍼
│   └── types.ts                           # TypeScript 타입 정의
├── proxy.ts                               # 어드민 라우트 보호 (Next.js 16 Proxy)
└── .env.local.example                     # 환경변수 예시
```
