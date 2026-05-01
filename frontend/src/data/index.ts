import { Team, Member, MealWeek } from '../types';

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

export const TODAY = new Date();

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

export function getMember(id: string, members: Member[]): Member | undefined {
  return members.find(m => m.id === id);
}

export function membersByTeam(teamId: string, members: Member[]): Member[] {
  return members.filter(m => m.teamId === teamId);
}
