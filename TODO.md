# TODO — 미구현 기능 목록

## 팀 관리 (`/teams`) ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**팀원 배정** 버튼~~ | ✅ AssignMembersModal — 체크박스로 다중 선택 후 팀 배정 |
| ~~**팀원 수정(edit)** 버튼~~ | ✅ EditMemberModal — 이름·팀·역할 편집 |
| ~~**팀원 상세(chevron)** 버튼~~ | 🗑 버튼 제거 |

---

## 일정 등록 모달 (`CreateEventModal`) ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**외근/출장** 유형 등록~~ | ✅ `type: 'trip'` PersonalEvent로 등록. chip-trip 스타일 추가 |

---

## 인증 (`/` 로그인, `/signup` 회원가입) ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**로그인 API 연동**~~ | ✅ `POST /api/auth/login` — bcrypt 검증 후 JWT 발급 |
| ~~**회원가입 API 연동**~~ | ✅ Step 1 `signup` → Step 2 `verify-email` → Step 3 `complete-signup` 전체 API 연동 |
| ~~**이메일 인증 코드 발송**~~ | ✅ nodemailer SMTP. SMTP 미설정 시 서버 콘솔에 코드 출력 (`.env`에서 설정) |
| ~~**로그아웃**~~ | ✅ localStorage에서 token + user 제거, AppContext 초기화 |
| ~~**인증 상태 지속**~~ | ✅ JWT를 `localStorage('token')`에 저장. API 요청 시 `Authorization: Bearer` 헤더 자동 부착. 401 시 자동 로그아웃 |
| ~~**로그인 사용자 연동**~~ | ✅ `AppContext.currentUser`로 로그인 유저 전역 관리. Sidebar에서 `currentUser` 표시 |

---

## 캘린더 (`/calendar`) ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**날짜 클릭 — 일정 등록**~~ | ✅ 셀 hover 시 우상단 + 버튼 표시, 클릭 시 해당 날짜로 CreateEventModal 오픈 |
| ~~**이벤트 칩 클릭 — 상세 보기**~~ | ✅ 칩 클릭 시 팝오버 — 개인일정(아바타·팀·타입·기간), 회사일정(제목·타입·시간·장소) |
| ~~**+N개 더보기**~~ | ✅ 클릭 시 해당 날짜 전체 이벤트 팝오버 표시, 칩 클릭 시 상세 팝오버로 연결 |

---

## 대시보드 (`/dashboard`) ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**다가오는 일정 클릭**~~ | ✅ 클릭 시 팝오버 — 제목·타입 chip·날짜·요일·시간·장소 |

---

## 공통 ✅ 완료

| 항목 | 설명 |
|------|------|
| ~~**일정 수정/삭제**~~ | ✅ 팝오버에 수정/삭제 버튼 추가. 수정 클릭 시 CreateEventModal edit 모드(사전 입력 + 저장/삭제) |
