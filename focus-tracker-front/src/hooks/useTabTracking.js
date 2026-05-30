import { useState, useEffect, useRef, useCallback } from "react";

const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

const DEFAULT_STATS = {
    tabSwitch: 0, // 탭 전환 횟수
    tabAway: 0, // 탭 이탈 누적 시간(초)
    rapidSwitch: 0, // 짧은 간격 반복 전환 횟수
    blockedAccess: 0, // 차단 사이트 접속 횟수
};

export function useTabTracking(running) {
    // 세션 전체 누적값 — 화면 표시 + 종합 집중도 점수용
    const [tabStats, setTabStats] = useState(DEFAULT_STATS);
    // 재시작 시마다 리셋되는 값 — 팝업 경고 발동 판단용
    const [alertStats, setAlertStats] = useState(DEFAULT_STATS);

    const lastSwitchTime = useRef(null);
    const awayStartTime = useRef(null);
    const prevWasAllowed = useRef(false);

    // 세션 완전 초기화
    const reset = useCallback(() => {
        setTabStats(DEFAULT_STATS);
        setAlertStats(DEFAULT_STATS);
        lastSwitchTime.current = null;
        awayStartTime.current = null;
        prevWasAllowed.current = false;
    }, []);

    // 휴식 후 재시작 시 — alertStats만 리셋 (tabStats 유지)
    const resetAlertStats = useCallback(() => {
        setAlertStats(DEFAULT_STATS);
    }, []);

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.origin !== FOCUS_TRACKER_ORIGIN) return;
            if (e.data?.type !== "TAB_CHANGED") return;
            if (!running) return;

            const { url, blocked, allowed } = e.data;
            const now = Date.now();
            const isCurrentTab = url.startsWith(FOCUS_TRACKER_ORIGIN);

            // Focus Tracker 탭으로 복귀 — 이탈 시간 종료만, 카운트 없음
            if (isCurrentTab) {
                if (awayStartTime.current) {
                    const awaySeconds = Math.floor(
                        (now - awayStartTime.current) / 1000,
                    );
                    awayStartTime.current = null;
                    if (awaySeconds > 0) {
                        setTabStats((prev) => ({
                            ...prev,
                            tabAway: prev.tabAway + awaySeconds,
                        }));
                        setAlertStats((prev) => ({
                            ...prev,
                            tabAway: prev.tabAway + awaySeconds,
                        }));
                    }
                }
                prevWasAllowed.current = false;
                return;
            }

            // 허용 사이트로 전환 — 모든 카운트 없음, 이탈 타이머도 시작 안 함
            if (allowed) {
                awayStartTime.current = null;
                prevWasAllowed.current = true;
                return;
            }

            // 직전이 허용 사이트였으면 tabSwitch/rapidSwitch 카운트 제외
            const fromAllowed = prevWasAllowed.current;
            prevWasAllowed.current = false;

            const isRapid =
                !fromAllowed &&
                lastSwitchTime.current !== null &&
                now - lastSwitchTime.current < 3000;
            lastSwitchTime.current = now;

            if (!awayStartTime.current) awayStartTime.current = now;

            if (!fromAllowed) {
                setTabStats((prev) => ({
                    ...prev,
                    tabSwitch: prev.tabSwitch + 1,
                    rapidSwitch: isRapid
                        ? prev.rapidSwitch + 1
                        : prev.rapidSwitch,
                    blockedAccess: blocked
                        ? prev.blockedAccess + 1
                        : prev.blockedAccess,
                }));
                setAlertStats((prev) => ({
                    ...prev,
                    tabSwitch: prev.tabSwitch + 1,
                    rapidSwitch: isRapid
                        ? prev.rapidSwitch + 1
                        : prev.rapidSwitch,
                    blockedAccess: blocked
                        ? prev.blockedAccess + 1
                        : prev.blockedAccess,
                }));
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [running]);

    return { tabStats, alertStats, reset, resetAlertStats };
}
