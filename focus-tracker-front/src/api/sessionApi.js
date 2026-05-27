// TODO: DB 연동 시 BASE_URL을 실제 서버 주소로 교체
const BASE_URL = "http://localhost:8080";

/**
 * 세션 데이터 저장
 * POST /api/session/save
 *
 * @param {Object} payload - 저장할 세션 데이터
 * @returns {Promise}
 */
export async function saveSession(payload) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/session/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`세션 저장 실패: ${res.status}`);
    return res.json();
}

/**
 * 사용자별 세션 이력 조회
 * GET /api/session/history
 *
 * 응답 예시:
 * {
 *   "2026-05-01": [
 *     { mode, focusSeconds, totalSeconds, maxFocusSeconds },
 *     ...
 *   ],
 *   ...
 * }
 *
 * @returns {Promise<Object>} 날짜별 세션 배열 ({ "YYYY-MM-DD": [...] })
 */
export async function getSessionHistory() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/session/history`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    if (!res.ok) throw new Error(`세션 이력 조회 실패: ${res.status}`);
    return res.json();
}
