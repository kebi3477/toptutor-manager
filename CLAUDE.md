# CLAUDE.md — TopTutor Manager

## 프로젝트 개요
사내 팀/인원/식단/일정 관리 대시보드. **백엔드 NestJS + 프론트엔드 React** 풀스택 모노레포.

---

## 개발 서버 실행

```bash
# 백엔드 (포트 3001)
cd backend && npm run start:dev

# 프론트엔드 (포트 3000)
cd frontend && npm start
```

---

## 아키텍처

```
toptutor-manager/
├── backend/   # NestJS 11, TypeORM, PostgreSQL
│   └── src/
│       ├── auth/      # JWT 인증 (로그인·회원가입·비밀번호 재설정)
│       ├── email/     # Nodemailer 이메일 서비스 (인증코드·비밀번호 재설정)
│       ├── events/    # 회사·개인 일정 API (company_events, personal_events 테이블)
│       ├── meals/     # 식단표 API (meal_days 테이블)
│       ├── teams/     # 팀 API (teams 테이블)
│       └── users/     # 사용자 API (users 테이블)
├── frontend/  # React 19, TypeScript, SCSS Modules
│   └── src/
│       ├── api/       # HTTP 클라이언트 (base / auth / meals / teams / users / events)
│       ├── context/   # AppContext (전역 상태: auth, events, users)
│       ├── layouts/   # Sidebar, Topbar
│       ├── pages/     # 라우트 페이지
│       ├── components/# 재사용 UI (Avatar, Icon, EventChip, CreateEventModal)
│       ├── data/      # 레거시 목 데이터 (MEMBERS — teams와 연결 참조용)
│       ├── types/     # TypeScript 인터페이스
│       ├── styles/    # 글로벌 디자인 시스템 (global.scss)
│       └── utils/     # 날짜 유틸 (date.ts)
└── design/    # 디자인 시안 파일 (참고용)
```

---

## 백엔드 규칙

### 모듈 구조 패턴
새 도메인 추가 시 `src/<domain>/` 디렉터리에 아래 파일 생성:
```
<domain>.entity.ts     → TypeORM 엔티티 (synchronize:true 로 자동 마이그레이션)
<domain>.service.ts    → 비즈니스 로직, OnModuleInit 에서 seed 실행
<domain>.controller.ts → REST 엔드포인트
<domain>.module.ts     → 모듈 정의
dto/create-<domain>.dto.ts
dto/update-<domain>.dto.ts
```
→ `app.module.ts` imports 배열에 모듈 추가 필수.

### 공통 설정
- 전역 prefix: `/api`
- ValidationPipe: `whitelist: true`, `transform: true`
- CORS: `http://localhost:3000` 허용
- DB: PostgreSQL, `synchronize: true` (개발), `.env`에서 설정

### 인증 (Auth)
- JWT 기반 인증 (`@nestjs/jwt`, `passport-jwt`)
- 토큰은 프론트에서 `Authorization: Bearer <token>` 헤더로 전송
- 보호가 필요한 엔드포인트에 `@UseGuards(JwtAuthGuard)` 적용
- 회원가입 플로우: 이메일 인증코드 발송 → 코드 확인 → 프로필 등록 순서
- 비밀번호: `bcrypt` 해싱, 평문 저장 절대 금지

### Email 서비스
- `EmailModule`/`EmailService` (Nodemailer) → `AuthModule`에서 import
- `.env`의 `MAIL_*` 환경변수로 SMTP 설정
- 인증코드 발송, 비밀번호 재설정 이메일 담당

### Seeding
서비스에서 `OnModuleInit` 구현 → `count === 0` 일 때만 초기 데이터 삽입.

### Entity 컨벤션
- PK: `@PrimaryGeneratedColumn('uuid')` 기본, 슬러그가 PK인 경우 `@PrimaryColumn({ type: 'varchar' })`
- 타임스탬프: `@CreateDateColumn`, `@UpdateDateColumn`
- JSONB 배열: `@Column({ type: 'jsonb', nullable: true })`

### 현재 엔티티 & 테이블

| 엔티티 | 테이블 | PK | 주요 필드 |
|--------|--------|-----|----------|
| User | `users` | varchar | `email`, `passwordHash`, `teamId`, `role`, `isAdmin` |
| Team | `teams` | varchar | `name`, `color`, `order` |
| MealDay | `meal_days` | uuid | `date`(unique), `weekStart`, `day`, `lunch`(jsonb), `holiday` |
| CompanyEvent | `company_events` | varchar | `title`, `date`, `startDate`, `endDate`, `time`, `location`, `type` |
| PersonalEvent | `personal_events` | varchar | `userId`, `type`, `startDate`, `endDate`, `half`, `label` |

---

## 프론트엔드 규칙

### 라우팅 (`App.tsx`)
```
/ (공개)              → LoginPage
/signup (공개)        → SignupPage
/forgot-password (공개) → ForgotPasswordPage
/dashboard            → Dashboard
/calendar             → CalendarPage
/meals                → MealsPage
/meals-edit           → MealsEdit      (어드민 전용)
/teams                → TeamsAdmin     (어드민 전용)
/users                → UsersAdmin     (어드민 전용)
/settings             → SettingsPage
```
- `PrivateRoute`: 미로그인 시 `/` 리다이렉트 (localStorage `auth` 키 확인)
- `PublicRoute`: 로그인 상태면 `/dashboard` 리다이렉트
- 어드민 전용 페이지: `isAdmin` 이 false면 `PlaceholderPage` 렌더링

### API 클라이언트 (`src/api/`)
도메인별로 파일 분리. 새 API 추가 시:
1. `src/api/<domain>.ts` 생성
2. `src/api/index.ts` 에 re-export 추가

```ts
// 패턴 예시
import { request } from './base';
export const fooApi = {
  getAll: () => request<Foo[]>('/foo'),
  create: (data: CreateFooPayload) => request<Foo>('/foo', { method: 'POST', body: JSON.stringify(data) }),
};
```

**base.ts 특이사항:**
- localStorage의 `auth` 파싱 → `accessToken`을 `Authorization: Bearer` 헤더에 자동 추가
- 401 응답 수신 시 localStorage 초기화 후 `/` 리다이렉트

**현재 API 파일:**
- `auth.ts` — authApi (signup, verifyEmail, completeSignup, login, getMe, changePassword, forgotPassword, resetPassword)
- `teams.ts` — teamsApi (getAll, create, update, remove)
- `meals.ts` — mealsApi (getWeeks, getWeek, updateDay, saveWeek)
- `users.ts` — usersApi (getAll, getOne, create, update, remove)
- `events.ts` — eventsApi (getAllCompany, createCompany, updateCompany, removeCompany, getAllPersonal, createPersonal, updatePersonal, removePersonal)

### 상태 관리
- 전역 상태: `AppContext` (`context/AppContext.tsx`)
- 로컬 상태: `useState` + `useEffect` + `useCallback`
- API 응답으로 UI 상태 업데이트 시 **로컬 merge** 원칙 (API 응답 전체를 교체하지 않음)

```ts
// 좋음: color만 merge → 기존 필드 보존
setTeams(prev => prev.map(t => t.id === id ? { ...t, color } : t));
// 위험: API 응답 누락 필드가 있을 경우 undefined 발생 가능
setTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
```

**AppContext 보유 상태:**
```ts
// Auth
currentUser: AuthUser | null
isAdmin: boolean  // currentUser.isAdmin 기반
logout: () => void

// 이벤트 모달
showCreateEvent: boolean
createEventInitialDate: string | null
editingEvent: EditingEvent | null

// 전역 데이터 (AppShell 마운트 시 로드)
users: User[]
companyEvents: CompanyEvent[]
personalEvents: PersonalEvent[]
```

### 데이터 상태 (`src/data/index.ts`)
- `MEMBERS` — 목 직원 데이터 (팀 ID로 teams 테이블 연결, 레거시 참조용)
- 모든 핵심 데이터는 API 연결 완료: **Auth**, **Teams**, **Meals**, **Users**, **Events**

### 스타일 시스템
- 글로벌 컴포넌트 클래스: `src/styles/global.scss`
- 페이지별 스타일: CSS Modules (`*.module.scss`)
- **CSS 변수로 색상/간격/그림자 관리** (하드코딩 금지)

주요 CSS 변수:
```
--brand: #FEA32B          --bg: #FAFAF7
--text: #1F1D17           --text-2: #4D4A40
--red: #D9504E            --green: #34A853
--surface: #FFFFFF        --divider: #F0EFE9
--sidebar-w: 232px        --header-h: 56px
```

주요 글로벌 클래스:
```
.btn .btn-primary .btn-ghost .btn-icon
.card .card-hd .card-title .card-sub
.modal-bg .modal .modal-hd .modal-bd .modal-ft
.input .field .field-label
.chip .chip-leave .chip-half
.user-table
.color-grid .color-chip
.role-pill .role-lead .role-mgr .role-staff
.row .muted .tnum .truncate .empty
```

### 모바일 반응형
- 사이드바: 768px 이하에서 drawer (햄버거 메뉴) 방식으로 전환
- 주요 브레이크포인트: `768px` (태블릿), `480px` (모바일)
- 각 페이지 `.module.scss`에 `@media (max-width: 768px)` 블록으로 관리

### 팀 컬러 팔레트 (`PRESET_COLORS`)
24색 정의됨 (블루/그린/레드핑크/옐로오렌지 계열 각 6색) — `TeamsAdmin.tsx` 참조.

---

## 타입 정의 (`src/types/index.ts`)

```ts
// 인증
AuthUser      { id, email, name, teamId, role, isAdmin }
AuthResponse  { accessToken, user: AuthUser }

// 도메인
Team          { id, name, color, order? }
User          { id, name, teamId, role, email?, isAdmin? }
CompanyEvent  { id, title, date?, startDate?, endDate?, time?, location?, type }
PersonalEvent { id, userId, type, startDate, endDate, half?, label }
MealDay       { date, day, weekStart?, breakfast?, lunch, holiday? }

// 페이로드
CreateTeamPayload      { id, name, color }
UpdateTeamPayload      { name?, color? }
CreateCompanyEventPayload  { title, date?, startDate?, endDate?, time?, location?, type }
CreatePersonalEventPayload { userId, type, startDate, endDate, half?, label }
```

---

## 인증 플로우

```
회원가입: POST /auth/signup → POST /auth/verify-email → POST /auth/complete-signup
로그인:   POST /auth/login → accessToken 수신 → localStorage 저장
인증확인: GET /auth/me (JWT 헤더)
비밀번호: PATCH /auth/change-password / POST /auth/forgot-password / POST /auth/reset-password
```

- 로그인 상태: `localStorage('auth')` JSON 파싱 후 `accessToken` 유무로 판단
- 어드민 여부: `AppContext.isAdmin` = `currentUser.isAdmin` (DB 기반, Topbar 표시 여부와 무관)

---

## 자주 하는 작업

**새 도메인 API 추가:**
1. `backend/src/<domain>/` 에 entity/dto/service/controller/module 생성
2. `app.module.ts` imports 에 모듈 등록
3. `frontend/src/api/<domain>.ts` 생성 후 `api/index.ts` re-export
4. `types/index.ts` 에 인터페이스 추가

**보호된 엔드포인트 추가:**
- 컨트롤러에 `@UseGuards(JwtAuthGuard)` 데코레이터 추가
- `@Request() req` 에서 `req.user` (AuthUser)로 현재 사용자 접근

**이벤트 생성 모달 트리거:**
- `AppContext.setShowCreateEvent(true)` 호출
- 날짜 지정 시 `setCreateEventInitialDate('YYYY-MM-DD')` 함께 호출
