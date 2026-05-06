# 메인 페이지

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
git pull origin feature/settings-page
git checkout feature/settings-page
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

## 브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속하면 확인 가능

## 폴더 구조

```
focus-tracker-front/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.jsx              # 상단 헤더 (모드 전환 nav, Settings 버튼)
│   │   ├── settings/
│   │   │   ├── ThresholdTable.jsx      # 경고창 팝업 기준값 테이블
│   │   │   ├── BlockedSiteList.jsx     # 금지 사이트 목록 (추가/삭제)
│   │   │   └── OptionToggles.jsx       # 선택 기능 토글 (팝업 허용, iframe 차단, 휴식 시간)
│   │   ├── DrowsyMonitor.jsx           # 졸음 감지 결과 표시 카드
│   │   ├── FocusRings.jsx              # 집중도 지표 링 차트 (7개 지표 + 종합)
│   │   ├── FocusTimeChart.jsx          # 집중 시간 반원 차트
│   │   └── Toast.jsx                   # 설정 저장 토스트 알림
│   │
│   ├── data/
│   │   └── modeData.js                 # 모드별 기준값·단위 데이터
│   │
│   ├── hooks/
│   │   └── useDrowsyDetection.js       # MediaPipe FaceMesh 기반 졸음 감지 훅
│   │                                   # (EAR/MAR/헤드틸트, 집중시간 누적)
│   ├── lib/
│   │   └── BlinkDetector.js            # 깜빡임 횟수·상태 계산 클래스
│   │
│   ├── pages/
│   │   ├── ModeSelectPage.jsx          # 모드 선택 화면 (강의/자료/잠금/휴식)
│   │   ├── MainPage.jsx                # 메인 화면 (졸음감지 + FocusRings + 집중시간)
│   │   ├── SettingsPage.jsx            # 설정 화면
│   │   └── ReportPage.jsx              # 세션 종료 후 리포트 화면
│   │
│   ├── App.jsx                         # 페이지 상태 관리, 전체 라우팅
│   ├── main.jsx                        # React 엔트리포인트
│   └── index.css                       # 전역 스타일 (box-sizing, font)
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 참고

- `node_modules` 폴더는 올라가 있지 않으므로 **반드시 `npm install`을 먼저 실행**해야 함
- 백엔드 API 연동은 `App.jsx`의 `handleSave` 함수에서 진행 예정
