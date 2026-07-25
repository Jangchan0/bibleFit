# Google Play 제출 체크리스트

## 현재 앱 설정

- 앱 이름: BibleFit
- Android package: `com.jangchan0.biblefit`
- Version name: `1.0.0`
- Production artifact: Android App Bundle, `.aab`
- 서버/API: 없음
- 광고/분석 SDK: 없음
- 생성형 AI API: 없음
- 성경 본문: eBible.org Korean Bible 1910 공개 도메인 자료 기반

## 빌드

```bash
npm run typecheck
npm run build:android
```

`npm run build:android`는 EAS production profile로 Google Play 제출용 `.aab`를 생성한다.

## 제출

```bash
npm run submit:android
```

현재 `eas.json`의 submit track은 안전하게 `internal`로 설정되어 있다. 내부 테스트에서 설치/알림/공유/묵상 타이머를 확인한 뒤 Play Console에서 production으로 승격한다.

## Play Console 입력값

- 앱/게임: 앱
- 카테고리 후보: 라이프스타일 또는 도서/참고자료
- 광고 포함 여부: 아니요
- 인앱 상품: 없음
- 로그인 필요 여부: 아니요
- 계정 생성: 없음
- 앱 액세스 제한: 없음
- 콘텐츠 등급: 전체 이용가 방향으로 설문 응답

## 개인정보 처리방침 URL

Play Console에는 공개 접근 가능한 개인정보 처리방침 URL이 필요하다.

우선 사용할 수 있는 후보:

```text
https://github.com/Jangchan0/bibleFit/blob/main/docs/privacy-policy.md
```

권장 운영 URL:

```text
https://jangchan0.github.io/bibleFit/privacy-policy
```

GitHub Pages를 켜면 `docs/privacy-policy.md`와 같은 내용을 정적 페이지로 제공하는 방식이 가장 깔끔하다.

## Data Safety 응답 방향

- 데이터 수집: 아니요
- 데이터 공유: 아니요
- 광고 ID 사용: 아니요
- 위치/연락처/사진/마이크 수집: 아니요
- 앱 활동/진단/분석 수집: 아니요
- 저장한 말씀과 알림 설정은 기기 내 저장만 사용

주의: 로컬 알림 권한은 알림 표시를 위한 권한이며, 사용자의 개인정보를 개발자 서버로 수집하지 않는다.

## 권한 확인

- 알림: 사용자가 알림 설정 시 사용
- 오디오: 앱에 포함된 로컬 배경음악 재생
- 마이크: 사용하지 않음
- 배경 오디오 서비스: 사용하지 않음

`expo-audio`는 녹음 권한을 기본 추가할 수 있으므로 `app.json`에서 `recordAudioAndroid: false`와 `RECORD_AUDIO` blocked permission을 유지한다.

## 최종 수동 QA

- 새 설치 후 오늘 말씀 표시
- 저장/저장 해제 후 재실행해도 유지
- 묵상 탭 1분/3분/5분 선택
- 묵상 시작/일시정지/초기화
- 배경음악 켜짐/꺼짐
- 알림 저장/끄기
- 카드 공유
- 설정 화면의 개인정보 처리와 성경 본문 출처 표기
