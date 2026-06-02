# Focus Tracker — 프론트엔드

## 실행 전 준비

Node.js가 설치되어 있어야 함

터미널에서 아래 명령어로 확인

```bash
node -v
npm -v
```

버전이 뜨지 않으면 [https://nodejs.org](https://nodejs.org) 에서 **LTS 버전**을 설치

---

## 실행 방법

### 1. 브랜치 가져오기

```bash
git pull origin hohong
git checkout hohong
```

### 2. 프로젝트 폴더로 이동

```bash
cd focus-tracker-front
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속하면 확인 가능

---

## 폴더 구조

```
focus-tracker-front/
├── src/
│   ├── api/
│   │   ├── authApi.js                  # 로그인 / 회원가입 / 로그아웃 API 호출
│   │   └── sessionApi.js               # 세션 저장 / 세션 이력 조회 API 호출
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx              # 상단 헤더 (모드 전환 nav, Settings / My Page / 로그아웃 버튼)
│   │   │   └── Header.module.css
│   │   ├── settings/
│   │   │   ├── ThresholdTable.jsx      # 탭 활동 경고 기준값 테이블
│   │   │   ├── BlockedSiteList.jsx     # 금지/허용 사이트 목록 (추가/삭제, placeholder prop으로 구분)
│   │   │   └── OptionToggles.jsx       # 선택 기능 토글 (2회 접속 시 금지 해제 팝업)
│   │   ├── DrowsyAlertModal.jsx        # 졸음 경고 팝업 (1~3단계, 휴식 타이머 설정 포함)
│   │   ├── DrowsyAlertModal.module.css
│   │   ├── UnblockModal.jsx            # 금지 사이트 2회 접속 시 해제 확인 팝업
│   │   ├── UnblockModal.module.css
│   │   ├── FocusRings.jsx              # 집중도 지표 링 차트 (4개 지표, 1×4 그리드)
│   │   ├── FocusRings.module.css
│   │   ├── FocusTimeChart.jsx          # 집중 시간 카드 (집중 / 전체 / 비집중)
│   │   ├── FocusTimeChart.module.css
│   │   ├── TabStats.jsx                # 탭 활동 카드 (모드별 비활성 항목 — 표시)
│   │   ├── TabStats.module.css
│   │   ├── RestStats.jsx               # 휴식 카드 (휴식 횟수 / 총 휴식 시간)
│   │   ├── RestStats.module.css
│   │   └── Toast.jsx                   # 설정 저장 토스트 알림
│   │
│   ├── data/
│   │   ├── modeData.js                 # 모드별 설정값 및 탭 활동 기본 임계값
│   │   └── dummySessionData.js         # MyPage 달력용 임시 데이터 (DB 연동 시 제거)
│   │
│   ├── hooks/
│   │   ├── useDrowsyDetection.js       # MediaPipe FaceMesh 기반 졸음 감지 훅
│   │   │                               # (EAR/MAR/고개기울기/고개방향, 집중·비집중·눈감김 시간 누적,
│   │   │                               #  최대 집중 시간 측정, 중지/재시작/초기화 지원)
│   │   ├── useDrowsyAlert.js           # 졸음 경고 단계 관리 훅
│   │   │                               # (9개 항목 감지, 3초 지속 시 발동, 30초 쿨다운,
│   │   │                               #  1~3단계 경고, alertLog 기록)
│   │   └── useTabTracking.js           # 크롬 익스텐션 탭 활동 수신 훅
│   │                                   # (허용 사이트 전환 시 카운트 제외)
│   │
│   ├── lib/
│   │   └── BlinkDetector.js            # 깜빡임 횟수·상태 계산 클래스
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx               # 로그인 화면
│   │   ├── SignupPage.jsx              # 회원가입 화면
│   │   ├── SessionSelectPage.jsx       # 로그인 후 선택 화면 (세션 시작 / 마이 페이지)
│   │   ├── ModeSelectPage.jsx          # 모드 선택 화면 (강의 / 자료 / 잠금)
│   │   ├── MainPage.jsx                # 메인 화면 (휴식·집중시간·탭활동 + 집중도 모니터링 + 졸음 경고)
│   │   ├── SettingsPage.jsx            # 설정 화면 (경고음·탭활동 기준·금지/허용 페이지·기타)
│   │   ├── ReportPage.jsx              # 세션 종료 후 리포트 화면 (종합집중도·세션요약·경고기록·총평)
│   │   └── MyPage.jsx                  # 마이페이지 (달력 + 세션 이력)
│   │
│   ├── App.jsx                         # 페이지 상태 관리, 전체 라우팅
│   │                                   # login → signup / sessionSelect → modeSelect → main → report
│   │                                   # main ↔ settings ↔ mypage
│   ├── main.jsx                        # React 엔트리포인트
│   └── index.css                       # 전역 스타일
│
├── focus-tracker-extension/
│   ├── manifest.json                   # 익스텐션 설정 (권한: tabs, storage)
│   ├── background.js                   # 탭 이벤트 감지 + 차단/허용 판단 + 2회 접속 팝업 트리거
│   └── content.js                      # 웹앱 ↔ 익스텐션 메시지 중계 + chrome.storage 연동
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 백엔드 연동 현황

| 기능                         | 상태       | 파일                    |
| ---------------------------- | ---------- | ----------------------- |
| 로그인 / 회원가입 / 로그아웃 | ✅ 완료    | `src/api/authApi.js`    |
| 세션 데이터 저장             | 🔄 진행 중 | `src/api/sessionApi.js` |
| 세션 이력 조회 (MyPage 달력) | 🔄 진행 중 | `src/api/sessionApi.js` |

> 자세한 Request/Response 스펙은 노션 **백엔드 연동 현황** 문서 참고

### DB 연동 시 할 일

- `src/api/sessionApi.js` — `BASE_URL` 실제 서버 주소로 교체
- `MyPage.jsx` — `useEffect` 주석 해제, `dummySessionData` import 제거
- `src/data/dummySessionData.js` — 파일 전체 제거

---

## 크롬 익스텐션 설치 방법

탭 활동 감지 기능을 사용하려면 익스텐션을 설치해야 함

1. 크롬 브라우저에서 `chrome://extensions` 접속
2. 우측 상단 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. `focus-tracker-extension` 폴더 선택

> 익스텐션 코드 수정 후에는 `chrome://extensions`에서 ↺ 재로드 + 웹앱 새로고침 필요

---

## 참고

- `node_modules` 폴더는 올라가 있지 않으므로 **반드시 `npm install`을 먼저 실행**해야 함
- 배포 시 `FOCUS_TRACKER_ORIGIN` 상수를 아래 4개 파일에서 모두 변경해야 함
    - `focus-tracker-extension/content.js`
    - `focus-tracker-extension/background.js`
    - `src/App.jsx`
    - `src/hooks/useTabTracking.js`
