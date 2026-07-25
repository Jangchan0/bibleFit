import type { SeedVerse } from '../types';

const BASE_VERSES = [
  {
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    theme: 'love',
  },
  {
    reference: 'Psalm 23:1',
    text: 'Yahweh is my shepherd: I shall lack nothing.',
    theme: 'peace',
  },
  {
    reference: 'Philippians 4:6',
    text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.',
    theme: 'anxiety',
  },
  {
    reference: 'Philippians 4:7',
    text: 'And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.',
    theme: 'peace',
  },
  {
    reference: 'Proverbs 3:5',
    text: 'Trust in Yahweh with all your heart, and do not lean on your own understanding.',
    theme: 'trust',
  },
  {
    reference: 'Proverbs 3:6',
    text: 'In all your ways acknowledge him, and he will make your paths straight.',
    theme: 'guidance',
  },
  {
    reference: 'Matthew 6:33',
    text: 'But seek first God\'s Kingdom and his righteousness; and all these things will be given to you as well.',
    theme: 'priority',
  },
  {
    reference: 'Isaiah 41:10',
    text: 'Do not be afraid, for I am with you. Do not be dismayed, for I am your God.',
    theme: 'courage',
  },
  {
    reference: 'Romans 8:28',
    text: 'We know that all things work together for good for those who love God, to those who are called according to his purpose.',
    theme: 'hope',
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, a very present help in trouble.',
    theme: 'refuge',
  },
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest.',
    theme: 'rest',
  },
  {
    reference: 'Joshua 1:9',
    text: 'Be strong and courageous. Do not be afraid; do not be dismayed, for Yahweh your God is with you wherever you go.',
    theme: 'courage',
  },
  {
    reference: '1 Peter 5:7',
    text: 'Cast all your worries on him, because he cares for you.',
    theme: 'care',
  },
  {
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp to my feet, and a light for my path.',
    theme: 'guidance',
  },
  {
    reference: 'Romans 12:12',
    text: 'Rejoicing in hope; enduring in troubles; continuing steadfastly in prayer.',
    theme: 'perseverance',
  },
  {
    reference: 'Colossians 3:23',
    text: 'And whatever you do, work heartily, as for the Lord, and not for men.',
    theme: 'work',
  },
  {
    reference: 'James 1:5',
    text: 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach; and it will be given to him.',
    theme: 'wisdom',
  },
  {
    reference: 'Psalm 34:18',
    text: 'Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.',
    theme: 'comfort',
  },
  {
    reference: 'Micah 6:8',
    text: 'What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?',
    theme: 'justice',
  },
  {
    reference: 'Galatians 6:9',
    text: 'Let us not be weary in doing good, for we will reap in due season, if we do not give up.',
    theme: 'perseverance',
  },
  {
    reference: 'Psalm 37:4',
    text: 'Also delight yourself in Yahweh, and he will give you the desires of your heart.',
    theme: 'delight',
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For God did not give us a spirit of fear, but of power, love, and self-control.',
    theme: 'courage',
  },
  {
    reference: 'Ephesians 4:32',
    text: 'And be kind to one another, tenderhearted, forgiving each other, just as God also in Christ forgave you.',
    theme: 'forgiveness',
  },
  {
    reference: 'Psalm 118:24',
    text: 'This is the day that Yahweh has made. We will rejoice and be glad in it!',
    theme: 'joy',
  },
  {
    reference: 'Hebrews 11:1',
    text: 'Now faith is assurance of things hoped for, proof of things not seen.',
    theme: 'faith',
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.',
    theme: 'strength',
  },
  {
    reference: 'Matthew 5:16',
    text: 'Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.',
    theme: 'witness',
  },
  {
    reference: 'John 14:27',
    text: 'Peace I leave with you. My peace I give to you; not as the world gives, I give to you.',
    theme: 'peace',
  },
  {
    reference: 'Romans 15:13',
    text: 'Now may the God of hope fill you with all joy and peace in believing.',
    theme: 'hope',
  },
  {
    reference: 'Psalm 121:2',
    text: 'My help comes from Yahweh, who made heaven and earth.',
    theme: 'help',
  },
  {
    reference: '1 Corinthians 16:14',
    text: 'Let all that you do be done in love.',
    theme: 'love',
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
    translation: 'WEB',
  };
});
