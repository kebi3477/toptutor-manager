import { Team, Member, CompanyEvent, PersonalEvent, MealWeek } from '../types';

export const TEAMS: Team[] = [
  { id: 'media', name: '미디어팀', color: '#7C8DB5' },
  { id: 'pr', name: '홍보팀', color: '#C28B8B' },
  { id: 'math', name: '수학팀', color: '#5B8DA8' },
  { id: 'sci', name: '과탐팀', color: '#6FA890' },
  { id: 'soc', name: '사탐팀', color: '#B89260' },
  { id: 'kor1', name: '국어기출팀', color: '#8B7BAB' },
  { id: 'kor2', name: '국어독해팀', color: '#A87B9D' },
  { id: 'eng1', name: '영어듣기팀', color: '#5F95A8' },
  { id: 'eng2', name: '영어기출팀', color: '#7BA08A' },
  { id: 'gen', name: '총무팀', color: '#9C8E7E' },
  { id: 'acc', name: '경리팀', color: '#A89270' },
  { id: 'design', name: '디자인팀', color: '#C2854A' },
];

const FIRST_NAMES = ['지훈','서연','민준','수아','도윤','지유','시우','하은','준우','채원','은우','다은','지호','윤서','태민','서윤','우진','지원','승현','예린','현우','수빈','정우','민서','재현','다현','선우','유진','동현','하린'];
const LAST_NAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','신','권','황','안','송','류','전','홍','문','양','손','배'];

function makeName(seed: number): string {
  const ln = LAST_NAMES[seed % LAST_NAMES.length];
  const fn = FIRST_NAMES[(seed * 7) % FIRST_NAMES.length];
  return ln + fn;
}

const TEAM_SIZES = [5, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4];

export const MEMBERS: Member[] = (() => {
  const out: Member[] = [];
  let id = 1;
  TEAMS.forEach((team, ti) => {
    for (let i = 0; i < TEAM_SIZES[ti]; i++) {
      const seed = id * 13 + ti;
      out.push({
        id: 'u' + id,
        name: makeName(seed),
        team: team.id,
        role: i === 0 ? '팀장' : id % 11 === 0 ? '매니저' : '사원',
        joinedYear: 2018 + (seed % 8),
      });
      id++;
    }
  });
  return out;
})();

export const ME = MEMBERS.find(m => m.id === 'u15')!;
export const ADMIN = MEMBERS[0];

export const TODAY = new Date(2026, 3, 30);

export const COMPANY_EVENTS: CompanyEvent[] = [
  { id: 'c1', title: '월례 전사 미팅', date: '2026-04-30', time: '14:00', location: '본사 대강당', type: 'meeting' },
  { id: 'c2', title: '신간 출시 컨퍼런스', date: '2026-05-07', time: '10:00', location: '강남 컨벤션', type: 'event' },
  { id: 'c3', title: '체육대회', date: '2026-05-15', startDate: '2026-05-15', endDate: '2026-05-15', time: '09:00', location: '한강공원', type: 'event' },
  { id: 'c4', title: '근로자의 날 (휴무)', date: '2026-05-01', type: 'holiday' },
  { id: 'c5', title: '어린이날 (휴무)', date: '2026-05-05', type: 'holiday' },
  { id: 'c6', title: '편집부 워크숍', date: '2026-05-22', startDate: '2026-05-22', endDate: '2026-05-23', location: '양평 연수원', type: 'event' },
  { id: 'c7', title: '분기 실적 보고', date: '2026-04-29', time: '15:00', location: '대회의실', type: 'meeting' },
];

export const PERSONAL_EVENTS: PersonalEvent[] = [
  { id: 'p1', userId: 'u3', type: 'leave', startDate: '2026-04-29', endDate: '2026-04-30', label: '연차' },
  { id: 'p2', userId: 'u8', type: 'leave', startDate: '2026-04-30', endDate: '2026-05-04', label: '연차' },
  { id: 'p3', userId: 'u14', type: 'half', startDate: '2026-04-30', endDate: '2026-04-30', half: 'PM', label: '오후 반차' },
  { id: 'p4', userId: 'u22', type: 'leave', startDate: '2026-04-28', endDate: '2026-04-30', label: '연차' },
  { id: 'p5', userId: 'u31', type: 'half', startDate: '2026-04-30', endDate: '2026-04-30', half: 'AM', label: '오전 반차' },
  { id: 'p6', userId: 'u5', type: 'leave', startDate: '2026-05-04', endDate: '2026-05-06', label: '연차' },
  { id: 'p7', userId: 'u12', type: 'leave', startDate: '2026-05-08', endDate: '2026-05-08', label: '연차' },
  { id: 'p8', userId: 'u17', type: 'half', startDate: '2026-05-04', endDate: '2026-05-04', half: 'PM', label: '오후 반차' },
  { id: 'p9', userId: 'u20', type: 'leave', startDate: '2026-05-11', endDate: '2026-05-13', label: '연차' },
  { id: 'p10', userId: 'u25', type: 'leave', startDate: '2026-05-07', endDate: '2026-05-07', label: '연차' },
  { id: 'p11', userId: 'u28', type: 'half', startDate: '2026-05-12', endDate: '2026-05-12', half: 'AM', label: '오전 반차' },
  { id: 'p12', userId: 'u33', type: 'leave', startDate: '2026-05-18', endDate: '2026-05-20', label: '연차' },
  { id: 'p13', userId: 'u40', type: 'leave', startDate: '2026-05-06', endDate: '2026-05-06', label: '연차' },
  { id: 'p14', userId: 'u15', type: 'leave', startDate: '2026-05-11', endDate: '2026-05-12', label: '연차 (예정)' },
  { id: 'p15', userId: 'u44', type: 'half', startDate: '2026-05-15', endDate: '2026-05-15', half: 'AM', label: '오전 반차' },
  { id: 'p16', userId: 'u9', type: 'leave', startDate: '2026-05-26', endDate: '2026-05-29', label: '연차' },
  { id: 'p17', userId: 'u18', type: 'leave', startDate: '2026-05-13', endDate: '2026-05-13', label: '연차' },
  { id: 'p18', userId: 'u36', type: 'leave', startDate: '2026-05-21', endDate: '2026-05-22', label: '연차' },
];

export const MEALS: Record<string, MealWeek> = {
  '2026-04-27': [
    { date: '2026-04-27', day: '월', breakfast: ['소고기무국','계란말이','김치','시금치나물','잡곡밥'], lunch: ['김치찌개','제육볶음','콩나물무침','오이무침','쌀밥','요거트'] },
    { date: '2026-04-28', day: '화', breakfast: ['북엇국','두부조림','김','깍두기','잡곡밥'], lunch: ['된장찌개','갈치구이','시래기무침','계란찜','쌀밥','과일'] },
    { date: '2026-04-29', day: '수', breakfast: ['미역국','진미채볶음','김치','애호박전','잡곡밥'], lunch: ['부대찌개','돈까스','양배추샐러드','단무지','쌀밥','아이스크림'] },
    { date: '2026-04-30', day: '목', breakfast: ['콩나물국','메추리알장조림','김치','연근조림','잡곡밥'], lunch: ['육개장','순살치킨','겉절이','감자조림','쌀밥','수박'] },
    { date: '2026-05-01', day: '금', breakfast: null, lunch: null, holiday: '근로자의 날' },
  ],
  '2026-05-04': [
    { date: '2026-05-04', day: '월', breakfast: ['황태해장국','고등어구이','김치','버섯볶음','잡곡밥'], lunch: ['김치찜','불고기','시금치나물','맛김','쌀밥','식혜'] },
    { date: '2026-05-05', day: '화', breakfast: null, lunch: null, holiday: '어린이날' },
    { date: '2026-05-06', day: '수', breakfast: ['시금치된장국','계란찜','김치','어묵볶음','잡곡밥'], lunch: ['순두부찌개','제육볶음','도라지무침','단호박샐러드','쌀밥','요거트'] },
    { date: '2026-05-07', day: '목', breakfast: ['콩비지찌개','진미채','김치','감자채볶음','잡곡밥'], lunch: ['짜장면','탕수육','단무지','양파','군만두','콜라'] },
    { date: '2026-05-08', day: '금', breakfast: ['소고기뭇국','계란말이','김치','콩나물','잡곡밥'], lunch: ['삼계탕','겉절이','부추전','과일샐러드','쌀밥','수정과'] },
  ],
  '2026-05-11': [
    { date: '2026-05-11', day: '월', breakfast: ['해물탕','김치','메추리알조림','시금치','잡곡밥'], lunch: ['갈비찜','잡채','김치','콩나물국','쌀밥','과일'] },
    { date: '2026-05-12', day: '화', breakfast: ['김치찌개','두부부침','김','애호박','잡곡밥'], lunch: ['비빔밥','미역국','계란후라이','튀김','요거트'] },
    { date: '2026-05-13', day: '수', breakfast: ['북엇국','계란찜','김치','감자조림','잡곡밥'], lunch: ['뼈해장국','고추장불고기','콩나물','김','쌀밥','식혜'] },
    { date: '2026-05-14', day: '목', breakfast: ['미역국','진미채','김치','시금치','잡곡밥'], lunch: ['우동','김밥','단무지','어묵','과일','요거트'] },
    { date: '2026-05-15', day: '금', breakfast: ['도가니탕','계란말이','김치','콩나물','잡곡밥'], lunch: ['도시락 (체육대회)','샌드위치','과일','음료','샐러드','김밥'] },
  ],
};

// ── Helpers ──────────────────────────────────────────────
export function getTeam(id: string): Team {
  return TEAMS.find(t => t.id === id)!;
}

export function getMember(id: string): Member {
  return MEMBERS.find(m => m.id === id)!;
}

export function membersByTeam(teamId: string): Member[] {
  return MEMBERS.filter(m => m.team === teamId);
}
