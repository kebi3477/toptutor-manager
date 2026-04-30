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
│       ├── meals/     # 식단표 API (meal_days 테이블)
│       └── teams/     # 팀 API (teams 테이블)
├── frontend/  # React 19, TypeScript, SCSS Modules
│   └── src/
│       ├── api/       # HTTP 클라이언트 (base / meals / teams)
│       ├── pages/     # 라우트 페이지
│       ├── components/# 재사용 UI (Avatar, Icon, EventChip)
│       ├── data/      # 목 데이터 (MEMBERS, COMPANY_EVENTS, PERSONAL_EVENTS 등)
│       ├── types/     # TypeScript 인터페이스
│       └── styles/    # 글로벌 디자인 시스템 (global.scss)
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

### Seeding
서비스에서 `OnModuleInit` 구현 → `count === 0` 일 때만 초기 데이터 삽입.

### Entity 컨벤션
- PK: `@PrimaryGeneratedColumn('uuid')` 기본, 슬러그가 PK인 경우 `@PrimaryColumn({ type: 'varchar' })`
- 타임스탬프: `@CreateDateColumn`, `@UpdateDateColumn`
- JSONB 배열: `@Column({ type: 'jsonb', nullable: true })`

---

## 프론트엔드 규칙

### 라우팅 (`App.tsx`)
```
/ (공개)           → LoginPage
/signup (공개)     → SignupPage
/dashboard         → Dashboard
/calendar          → CalendarPage
/meals             → MealsPage
/meals-edit        → MealsEdit   (어드민 전용)
/teams             → TeamsAdmin  (어드민 전용)
/users             → UsersAdmin  (어드민 전용)
```
- `PrivateRoute`: 미로그인 시 `/` 리다이렉트
- `PublicRoute`: 로그인 상태면 `/dashboard` 리다이렉트
- 어드민 전용 페이지: `isAdmin` 이 false면 placeholder 렌더링

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

### 상태 관리
- 전역 상태: `AppContext` (`isAdmin`, `showCreateEvent`)
- 로컬 상태: `useState` + `useEffect` + `useCallback`
- API 응답으로 UI 상태 업데이트 시 **로컬 merge** 원칙 (API 응답 전체를 교체하지 않음)

```ts
// 좋음: color만 merge → 기존 필드 보존
setTeams(prev => prev.map(t => t.id === id ? { ...t, color } : t));
// 위험: API 응답 누락 필드가 있을 경우 undefined 발생 가능
setTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
```

### 목 데이터 (`src/data/index.ts`)
아직 API로 전환 안 된 데이터:
- `MEMBERS` — 전체 직원 49명 (팀 ID로 teams 테이블과 연결)
- `COMPANY_EVENTS` / `PERSONAL_EVENTS` — 회사 일정 / 휴가
- `MEALS` — 식단 (실제 API로 대체됨, 레거시 참조용 남아있음)

API 연결된 데이터: **Meals**, **Teams**

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

### 팀 컬러 팔레트 (`PRESET_COLORS`)
24색 정의됨 (블루/그린/레드핑크/옐로오렌지 계열 각 6색) — `TeamsAdmin.tsx` 참조.

---

## 타입 정의 (`src/types/index.ts`)

```ts
Team        { id, name, color, order? }
Member      { id, name, team, role, joinedYear }
CompanyEvent{ id, title, date?, startDate?, endDate?, time?, location?, type }
PersonalEvent{ id, userId, type, startDate, endDate, half?, label }
MealDay     { date, day, weekStart?, breakfast?, lunch, holiday? }
CreateTeamPayload  { id, name, color }
UpdateTeamPayload  { name?, color? }
```

---

## 인증
- 로그인 상태: `localStorage('auth')` key 여부로 판단
- 어드민 모드: `AppContext.isAdmin` toggle (Topbar에서 전환)

---

## 자주 하는 작업

**새 도메인 API 추가:**
1. `backend/src/<domain>/` 에 entity/dto/service/controller/module 생성
2. `app.module.ts` imports 에 모듈 등록
3. `frontend/src/api/<domain>.ts` 생성 후 `api/index.ts` re-export
4. `types/index.ts` 에 인터페이스 추가

**기존 목 데이터 API 전환:**
- 해당 페이지의 `data` import를 제거하고 `useEffect`로 API 호출
- 초기 `useState([])` + loading state 패턴 사용
