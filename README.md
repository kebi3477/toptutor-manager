# TopTutor Manager

사내 팀·인원·식단·일정을 관리하는 웹 대시보드입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, React Router v7, SCSS Modules |
| 백엔드 | NestJS 11, TypeORM, PostgreSQL |
| 인프라 | 로컬 PostgreSQL (개발 환경) |

## 주요 기능

- **대시보드** — 오늘의 일정·식단·팀 현황 한눈에 확인
- **캘린더** — 회사 일정, 개인 휴가(연차·반차) 조회
- **식단표** — 주간 구내식당 메뉴 조회 / 어드민 등록·편집
- **팀 관리** — 팀 추가·삭제·이름·컬러 변경, 팀원 현황
- **사용자 관리** — 전체 임직원 조회·관리
- **어드민 모드** — Topbar 토글로 관리자 기능 활성화

## 시작하기

### 요구사항

- Node.js 18+
- PostgreSQL 14+

### 환경 설정

**백엔드** (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=toptutor_manager
PORT=3001
NODE_ENV=development
```

**프론트엔드** (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 설치 및 실행

```bash
# 의존성 설치
cd backend && npm install
cd ../frontend && npm install

# 개발 서버 실행 (터미널 2개)
cd backend && npm run start:dev   # http://localhost:3001
cd frontend && npm start          # http://localhost:3000
```

DB 테이블은 앱 시작 시 자동 생성(`synchronize: true`)되고, 초기 데이터(팀 12개, 식단 3주)도 자동으로 seed됩니다.

## 프로젝트 구조

```
toptutor-manager/
├── backend/
│   └── src/
│       ├── meals/          # 식단 API (/api/meals)
│       ├── teams/          # 팀 API (/api/teams)
│       └── app.module.ts
├── frontend/
│   └── src/
│       ├── api/            # HTTP 클라이언트 (base / meals / teams)
│       ├── pages/          # 라우트 페이지
│       ├── components/     # 공통 UI 컴포넌트
│       ├── data/           # 목 데이터 (미전환 도메인)
│       ├── types/          # TypeScript 타입 정의
│       └── styles/         # 글로벌 디자인 시스템
└── design/                 # 디자인 시안 (참고용)
```

## API 엔드포인트

### Teams `/api/teams`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/teams` | 전체 팀 목록 |
| GET | `/api/teams/:id` | 팀 단건 조회 |
| POST | `/api/teams` | 팀 생성 |
| PUT | `/api/teams/:id` | 팀 수정 (이름·컬러) |
| DELETE | `/api/teams/:id` | 팀 삭제 |

### Meals `/api/meals`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/meals/weeks` | 주차 목록 |
| GET | `/api/meals?week=YYYY-MM-DD` | 특정 주 식단 |
| PUT | `/api/meals/:date` | 특정 날 식단 수정 |

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
