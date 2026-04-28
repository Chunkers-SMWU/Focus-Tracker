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
│   │   ├── ModeSelector.jsx       # 모드 선택 카드
│   │   ├── ThresholdTable.jsx     # 경고창 팝업 기준 테이블
│   │   ├── BlockedSiteList.jsx    # 금지 페이지 목록
│   │   ├── OptionToggles.jsx      # 선택 기능 토글
│   │   └── Toast.jsx              # 저장 완료 알림
│   ├── data/
│   │   └── modeData.js            # 모드별 기준값 상수
│   ├── App.jsx                    # 전체 상태 관리
│   ├── main.jsx                   # React 진입점
│   └── index.css                  # 글로벌 스타일
├── index.html
├── package.json
└── vite.config.js
```

---

## 참고

- `node_modules` 폴더는 올라가 있지 않으므로 **반드시 `npm install`을 먼저 실행**해야 함
- 백엔드 API 연동은 `App.jsx`의 `handleSave` 함수에서 진행 예정
