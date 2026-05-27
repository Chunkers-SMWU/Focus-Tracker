# Focus Tracker 크롬 익스텐션

## 로컬 개발 시 설치 방법

1. 크롬 주소창에 `chrome://extensions` 입력
2. 우측 상단 **개발자 모드** 토글 ON
3. **압축해제된 확장 프로그램 로드** 클릭
4. `focus-tracker-extension/` 폴더 선택

> 익스텐션 코드 수정 후에는 반드시 `chrome://extensions`에서 ↺ 재로드 + 웹앱 새로고침 필요

---

## 폴더 구조

```
focus-tracker-extension/
├── manifest.json   # 익스텐션 설정 및 권한 선언 (tabs, storage, host_permissions)
├── background.js   # 탭 감지 · 차단/허용 판단 · 2회 접속 시 팝업 트리거
└── content.js      # 웹앱 ↔ 익스텐션 메시지 중계 · chrome.storage 연동
```

---

## 동작 방식

웹앱(React)은 보안상 다른 탭의 URL에 접근할 수 없어서, 크롬 익스텐션이 탭을 감지하고 웹앱에 메시지를 전달하는 역할을 함.

```
사용자가 탭 전환
      ↓
background.js — 탭 이벤트 감지 + 차단/허용 여부 판단
      ↓
content.js — 메시지 중계 (chrome.runtime ↔ window.postMessage)
      ↓
useTabTracking.js — 탭 통계 카운트
      ↓
useDrowsyAlert.js — 경고 판단
```

---

## 메시지 타입

| 타입                 | 방향                  | 역할                       |
| -------------------- | --------------------- | -------------------------- |
| `TAB_CHANGED`        | background → 웹앱     | url, blocked, allowed 포함 |
| `BLOCKED_TWICE`      | background → 웹앱     | 금지 사이트 2회 접속 알림  |
| `SAVE_SITES`         | 웹앱 → chrome.storage | 차단 목록 저장             |
| `LOAD_SITES`         | 웹앱 → chrome.storage | 차단 목록 로드             |
| `SAVE_ALLOWED_SITES` | 웹앱 → chrome.storage | 허용 목록 저장             |
| `LOAD_ALLOWED_SITES` | 웹앱 → chrome.storage | 허용 목록 로드             |
| `SAVE_ALLOW_POPUP`   | 웹앱 → chrome.storage | 금지 해제 팝업 설정 저장   |

---

## chrome.storage 저장 항목

| 키             | 타입       | 설명                                   |
| -------------- | ---------- | -------------------------------------- |
| `blockedSites` | `string[]` | 금지 사이트 목록                       |
| `allowedSites` | `string[]` | 허용 사이트 목록 (탭 통계 카운트 제외) |
| `allowPopup`   | `boolean`  | 2회 접속 시 금지 해제 팝업 활성 여부   |

---

## 탭 전환 케이스별 처리

| 케이스                      | 처리                                         |
| --------------------------- | -------------------------------------------- |
| Focus Tracker 탭으로 복귀   | 이탈 시간 종료만. 탭 통계 카운트 없음        |
| 허용 사이트로 전환          | 모든 카운트 없음, 이탈 타이머도 없음         |
| 직전이 허용 사이트였던 경우 | tabSwitch / rapidSwitch 카운트 제외          |
| 일반/차단 사이트 전환       | tabSwitch, rapidSwitch, blockedAccess 카운트 |

---

## 배포 시 주의사항

아래 **4개 파일**의 `FOCUS_TRACKER_ORIGIN` 값을 실제 도메인으로 변경 필요

```js
// 변경 전
const FOCUS_TRACKER_ORIGIN = "http://localhost:5173";

// 변경 후
const FOCUS_TRACKER_ORIGIN = "https://your-domain.com";
```

변경 대상 파일:

- `focus-tracker-extension/background.js`
- `focus-tracker-extension/content.js`
- `focus-tracker-front/src/App.jsx`
- `focus-tracker-front/src/hooks/useTabTracking.js`
