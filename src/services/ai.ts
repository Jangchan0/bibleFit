import type { Verse } from '../types';

declare const process: {
  env?: Record<string, string | undefined>;
};

export const AI_PROMPT_VERSION = 'v1';

export function getGeminiModel() {
  return process.env?.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-1.5-flash';
}

export async function fetchAiInterpretation(verse: Verse) {
  const apiKey = process.env?.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = getGeminiModel();

  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Verse: ${verse.reference}\n${verse.text}\n\nApply this Bible verse to an ordinary modern day in Korean in 2-3 warm, clear sentences.`,
              },
            ],
            role: 'user',
          },
        ],
        generationConfig: {
          maxOutputTokens: 240,
          temperature: 0.7,
        },
        systemInstruction: {
          parts: [
            {
              text: '성경 구절을 현대인의 일상 언어로 2~3문장으로 따뜻하고 명확하게 적용/요약해줘.',
            },
          ],
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini 요청 실패: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const interpretation = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!interpretation) {
    throw new Error('Gemini 응답에서 해석 문장을 찾지 못했습니다.');
  }

  return { interpretation, model };
}
