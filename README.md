# TopTutor Manager

사내 팀·인원·식단·일정을 관리하는 웹 대시보드입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, React Router v7, SCSS Modules |
| 백엔드 | NestJS 11, TypeORM, PostgreSQL |
| 인증 | JWT (passport-jwt), bcrypt, Nodemailer |
| 인프라 | 로컬 PostgreSQL (개발 환경), Docker Compose |

## 주요 기능

- **인증** — 이메일 인증 기반 회원가입, JWT 로그인, 비밀번호 재설정
- **대시보드** — 오늘의 일정·식단·팀 현황 한눈에 확인
- **캘린더** — 회사 일정, 개인 휴가(연차·반차·출장) 조회·등록·수정
- **식단표** — 주간 구내식당 메뉴 조회 / 어드민 등록·편집
- **팀 관리** — 팀 추가·삭제·이름·컬러 변경, 팀원 현황
- **사용자 관리** — 전체 임직원 조회·관리, 어드민 권한 설정
- **설정** — 비밀번호 변경
- **모바일 지원** — 768px/480px 반응형 레이아웃

## 시작하기

### 개발 환경

**요구사항**

- Node.js 22+
- PostgreSQL 16+

**환경 설정**

`backend/.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=toptutor_manager
PORT=3001
NODE_ENV=development

JWT_SECRET=your-secret-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TopTutor <your@gmail.com>
```

**실행**

```bash
# 의존성 설치
cd backend && npm install
cd ../frontend && npm install

# 개발 서버 실행 (터미널 2개)
cd backend && npm run start:dev   # http://localhost:3001
cd frontend && npm start          # http://localhost:3000
```

DB 테이블은 앱 시작 시 자동 생성(`synchronize: true`)되고, 초기 데이터(팀 12개, 식단 3주)도 자동으로 seed됩니다.

---

## 프로덕션 배포 (Docker + SSL)

### 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
  - Windows: WSL2 백엔드 권장 (`wsl --install`)
- 도메인 및 SSL 인증서 (`.crt` / `.key` 파일)

### 1. 인증서 파일 배치

```
nginx/certs/
├── server.crt   ← 인증서 (체인 포함 fullchain 권장)
└── server.key   ← 개인키
```

> 인증서 파일은 `.gitignore`에 포함되어 있으므로 서버에서 직접 넣어야 합니다.

### 2. 환경변수 설정

**루트 `.env`** — 도메인 설정:

```env
DOMAIN=your-domain.com
```

**`backend/.env`** — `backend/.env.production.example`을 복사 후 값 입력:

```bash
cp backend/.env.production.example backend/.env
```

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=toptutor
DB_PASSWORD=강력한_비밀번호
DB_NAME=toptutor_manager
DB_SYNC=true

# PostgreSQL 컨테이너 초기화 (DB_* 값과 동일하게)
POSTGRES_USER=toptutor
POSTGRES_PASSWORD=강력한_비밀번호
POSTGRES_DB=toptutor_manager

# App
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=랜덤_64자_이상_문자열
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-domain.com

# SMTP
SMTP_HOST=smtp.naver.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=앱_비밀번호
SMTP_FROM=TopTutor 매니저 <your@email.com>
```

### 3. 빌드 및 실행

> **최초 배포 시**: `backend/.env`에서 `DB_SYNC=true`로 설정해 테이블을 생성한 뒤, 컨테이너가 정상 기동되면 `DB_SYNC=false`로 변경하고 `docker compose restart backend`를 실행하세요. 이후 스키마 변경은 마이그레이션으로 관리합니다.

```bash
# 처음 실행 또는 코드 변경 후
docker compose up -d --build

# 로그 확인
docker compose logs -f

# 중지
docker compose down
```

### 4. 자동 시작 (Windows)

Docker Desktop 설정 → **Start Docker Desktop when you log in** 체크.
`restart: unless-stopped`가 설정되어 있으므로 Docker가 켜지면 컨테이너는 자동으로 재시작됩니다.

### 아키텍처

```
인터넷 (HTTPS 443 / HTTP 80)
        ↓
  frontend 컨테이너 (nginx)
  ├── HTTP 80  → HTTPS 리다이렉트
  ├── /*       → React 정적 파일 서빙
  └── /api/*   → backend 컨테이너 프록시 (내부 네트워크)
                        ↓
               backend 컨테이너 (NestJS :3001)
                        ↓
               db 컨테이너 (PostgreSQL :5432)
```

SSL은 nginx(frontend 컨테이너)에서만 처리합니다. 백엔드와 DB는 외부에 노출되지 않으며 Docker 내부 네트워크로만 통신합니다.

### 인증서 교체

인증서 갱신 시 파일만 교체하고 재시작하면 됩니다. 빌드는 불필요합니다.

```bash
# nginx/certs/ 파일 교체 후
docker compose restart frontend
```

## 프로젝트 구조

```
toptutor-manager/
├── backend/
│   └── src/
│       ├── auth/           # JWT 인증 (/api/auth)
│       ├── email/          # Nodemailer 이메일 서비스
│       ├── events/         # 회사·개인 일정 API (/api/events)
│       ├── meals/          # 식단 API (/api/meals)
│       ├── teams/          # 팀 API (/api/teams)
│       ├── users/          # 사용자 API (/api/users)
│       └── app.module.ts
├── frontend/
│   └── src/
│       ├── api/            # HTTP 클라이언트 (도메인별 파일)
│       ├── context/        # AppContext (전역 상태)
│       ├── layouts/        # Sidebar, Topbar
│       ├── pages/          # 라우트 페이지 (10개)
│       ├── components/     # 공통 UI 컴포넌트
│       ├── types/          # TypeScript 타입 정의
│       └── styles/         # 글로벌 디자인 시스템
└── design/                 # 디자인 시안 (참고용)
```

## API 엔드포인트

### Auth `/api/auth`

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 이메일 인증코드 발송 |
| POST | `/api/auth/verify-email` | 인증코드 확인 |
| POST | `/api/auth/complete-signup` | 프로필 등록 후 가입 완료 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/auth/me` | 현재 사용자 정보 |
| PATCH | `/api/auth/change-password` | 비밀번호 변경 |
| POST | `/api/auth/forgot-password` | 비밀번호 재설정 코드 발송 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 |

### Teams `/api/teams`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/teams` | 전체 팀 목록 |
| GET | `/api/teams/:id` | 팀 단건 조회 |
| POST | `/api/teams` | 팀 생성 |
| PUT | `/api/teams/:id` | 팀 수정 (이름·컬러) |
| DELETE | `/api/teams/:id` | 팀 삭제 |

### Users `/api/users`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/users` | 전체 사용자 목록 |
| GET | `/api/users/:id` | 사용자 단건 조회 |
| POST | `/api/users` | 사용자 생성 |
| PUT | `/api/users/:id` | 사용자 수정 (이름·팀·역할·어드민) |
| DELETE | `/api/users/:id` | 사용자 삭제 |

### Meals `/api/meals`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/meals/weeks` | 주차 목록 |
| GET | `/api/meals?week=YYYY-MM-DD` | 특정 주 식단 |
| PUT | `/api/meals/:date` | 특정 날 식단 수정 |

### Events `/api/events`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/events/company` | 회사 일정 전체 |
| POST | `/api/events/company` | 회사 일정 등록 |
| PUT | `/api/events/company/:id` | 회사 일정 수정 |
| DELETE | `/api/events/company/:id` | 회사 일정 삭제 |
| GET | `/api/events/personal` | 개인 일정 전체 |
| POST | `/api/events/personal` | 개인 일정 등록 |
| PUT | `/api/events/personal/:id` | 개인 일정 수정 |
| DELETE | `/api/events/personal/:id` | 개인 일정 삭제 |

## 스크립트

```bash
# 백엔드
npm run start:dev   # 개발 서버 (파일 감시)
npm run build       # 프로덕션 빌드
npm run test        # 단위 테스트

# 프론트엔드
npm start           # 개발 서버
npm run build       # 프로덕션 빌드
npm test            # 테스트
```
