import type { SeedVerse } from '../types';

// MVP seed uses Korean Bible 1910 (source id: KOROLD), which is distributed as public domain by eBible.org.
const BASE_VERSES = [
  {
    reference: '요한복음 3:16',
    text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라',
    theme: '사랑',
  },
  {
    reference: '시편 23:1',
    text: '여호와는 나의 목자시니 내가 부족함이 없으리로다',
    theme: '평안',
  },
  {
    reference: '빌립보서 4:6',
    text: '아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라',
    theme: '염려',
  },
  {
    reference: '빌립보서 4:7',
    text: '그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라',
    theme: '평안',
  },
  {
    reference: '잠언 3:5',
    text: '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라',
    theme: '신뢰',
  },
  {
    reference: '잠언 3:6',
    text: '너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
    theme: '인도',
  },
  {
    reference: '마태복음 6:33',
    text: '너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라',
    theme: '우선순위',
  },
  {
    reference: '이사야 41:10',
    text: '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라',
    theme: '담대함',
  },
  {
    reference: '로마서 8:28',
    text: '우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    theme: '소망',
  },
  {
    reference: '시편 46:1',
    text: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라',
    theme: '피난처',
  },
  {
    reference: '마태복음 11:28',
    text: '수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라',
    theme: '쉼',
  },
  {
    reference: '여호수아 1:9',
    text: '마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라',
    theme: '담대함',
  },
  {
    reference: '베드로전서 5:7',
    text: '너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라',
    theme: '돌보심',
  },
  {
    reference: '시편 119:105',
    text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    theme: '인도',
  },
  {
    reference: '로마서 12:12',
    text: '소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며',
    theme: '인내',
  },
  {
    reference: '골로새서 3:23',
    text: '무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라',
    theme: '일상',
  },
  {
    reference: '야고보서 1:5',
    text: '너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라',
    theme: '지혜',
  },
  {
    reference: '시편 34:18',
    text: '여호와는 마음이 상한 자에게 가까이 하시고 중심에 통회하는 자를 구원하시는도다',
    theme: '위로',
  },
  {
    reference: '미가 6:8',
    text: '여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐',
    theme: '공의',
  },
  {
    reference: '갈라디아서 6:9',
    text: '우리가 선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라',
    theme: '인내',
  },
  {
    reference: '시편 37:4',
    text: '또 여호와를 기뻐하라 저가 네 마음의 소원을 이루어 주시리로다',
    theme: '기쁨',
  },
  {
    reference: '디모데후서 1:7',
    text: '하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 근신하는 마음이니',
    theme: '담대함',
  },
  {
    reference: '에베소서 4:32',
    text: '서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라',
    theme: '용서',
  },
  {
    reference: '시편 118:24',
    text: '이 날은 여호와의 정하신 것이라 이 날에 우리가 즐거워하고 기뻐하리로다',
    theme: '기쁨',
  },
  {
    reference: '히브리서 11:1',
    text: '믿음은 바라는 것들의 실상이요 보지 못하는 것들의 증거니',
    theme: '믿음',
  },
  {
    reference: '이사야 40:31',
    text: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요',
    theme: '새힘',
  },
  {
    reference: '마태복음 5:16',
    text: '이같이 너희 빛을 사람 앞에 비취게 하여 저희로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라',
    theme: '증거',
  },
  {
    reference: '요한복음 14:27',
    text: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라',
    theme: '평안',
  },
  {
    reference: '로마서 15:13',
    text: '소망의 하나님이 모든 기쁨과 평강을 믿음 안에서 너희에게 충만케 하사 성령의 능력으로 소망이 넘치게 하시기를 원하노라',
    theme: '소망',
  },
  {
    reference: '시편 121:2',
    text: '나의 도움이 천지를 지으신 여호와에게서로다',
    theme: '도움',
  },
  {
    reference: '고린도전서 16:14',
    text: '너희 모든 일을 사랑으로 행하라',
    theme: '사랑',
  },
] as const;

const MONTH_DAY_COUNTS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function buildDateKeys() {
  return MONTH_DAY_COUNTS.flatMap((days, monthIndex) =>
    Array.from({ length: days }, (_, dayIndex) => {
      const month = String(monthIndex + 1).padStart(2, '0');
      const day = String(dayIndex + 1).padStart(2, '0');
      return `${month}-${day}`;
    }),
  );
}

export const DAILY_VERSES: SeedVerse[] = buildDateKeys().map((dateKey, index) => {
  const base = BASE_VERSES[index % BASE_VERSES.length];
  return {
    id: dateKey,
    dateKey,
    reference: base.reference,
    text: base.text,
    theme: base.theme,
    translation: '한글성경',
  };
});
