// TODO: DB 연동 시 이 파일 전체 제거 후 API 호출로 교체
// 키: "YYYY-MM-DD", 값: 세션 배열 (진행 순서대로)
export const dummySessionData = {
    "2026-05-01": [
        {
            mode: "강의",
            focusSeconds: 3200,
            totalSeconds: 4000,
            maxFocusSeconds: 1800,
        },
    ],
    "2026-05-05": [
        {
            mode: "자료",
            focusSeconds: 1800,
            totalSeconds: 2500,
            maxFocusSeconds: 900,
        },
    ],
    "2026-05-08": [
        {
            mode: "강의",
            focusSeconds: 5400,
            totalSeconds: 6000,
            maxFocusSeconds: 3200,
        },
        {
            mode: "자료",
            focusSeconds: 2100,
            totalSeconds: 2800,
            maxFocusSeconds: 1200,
        },
    ],
    "2026-05-12": [
        {
            mode: "잠금",
            focusSeconds: 900,
            totalSeconds: 1800,
            maxFocusSeconds: 600,
        },
    ],
    "2026-05-15": [
        {
            mode: "강의",
            focusSeconds: 4100,
            totalSeconds: 4800,
            maxFocusSeconds: 2400,
        },
    ],
    "2026-05-19": [
        {
            mode: "자료",
            focusSeconds: 2700,
            totalSeconds: 3300,
            maxFocusSeconds: 1500,
        },
        {
            mode: "잠금",
            focusSeconds: 1100,
            totalSeconds: 1600,
            maxFocusSeconds: 700,
        },
        {
            mode: "강의",
            focusSeconds: 3000,
            totalSeconds: 3500,
            maxFocusSeconds: 1800,
        },
    ],
    "2026-05-22": [
        {
            mode: "잠금",
            focusSeconds: 600,
            totalSeconds: 1200,
            maxFocusSeconds: 400,
        },
    ],
    "2026-05-26": [
        {
            mode: "강의",
            focusSeconds: 3900,
            totalSeconds: 4500,
            maxFocusSeconds: 2200,
        },
        {
            mode: "자료",
            focusSeconds: 1600,
            totalSeconds: 2000,
            maxFocusSeconds: 900,
        },
    ],
};
