# Focus Tracker 크롬 익스텐션

## 로컬 개발 시 설치 방법

1. 크롬 주소창에 `chrome://extensions` 입력
2. 우측 상단 **개발자 모드** 토글 ON
3. **압축해제된 확장 프로그램 로드** 클릭
4. `focus-tracker-extension/` 폴더 선택

---

## 폴더 구조

```
focus-tracker-extension/
├── manifest.json   # 익스텐션 설정 및 권한 선언
├── background.js   # 탭 감지 · 차단 체크 · 메시지 전송
└── content.js      # 웹앱 ↔ 익스텐션 메시지 중계
```

---

## 배포 시 주의사항

아래 세 파일의 `FOCUS_TRACKER_ORIGIN` 값을 실제 도메인으로 변경 필요

```js
// 변경 전
const FOCUS_TRACKER_ORIGIN = "http://localhost:5173";

// 변경 후
const FOCUS_TRACKER_ORIGIN = "https://your-domain.com";
```

변경 대상 파일:

- `focus-tracker-extension/content.js`
- `focus-tracker-front/src/App.jsx`
- `focus-tracker-front/src/hooks/useTabTracking.js`
