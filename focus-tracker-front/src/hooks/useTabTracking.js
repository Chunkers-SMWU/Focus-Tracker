import { useState, useEffect, useRef, useCallback } from "react";

const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

const DEFAULT_STATS = {
    tabSwitch: 0, // 탭 전환 횟수
    tabAway: 0, // 탭 이탈 누적 시간(초)
    rapidSwitch: 0, // 짧은 간격 반복 전환 횟수
    blockedAccess: 0, // 차단 사이트 접속 횟수
};

export function useTabTracking(running) {
    const [tabStats, setTabStats] = useState(DEFAULT_STATS);

    // 마지막 탭 전환 시각 (빠른 반복 전환 감지용)
    const lastSwitchTime = useRef(null);
    // 탭 이탈 시작 시각 (이탈 시간 누적용)
    const awayStartTime = useRef(null);

    // 초기화
    const reset = useCallback(() => {
        setTabStats(DEFAULT_STATS);
        lastSwitchTime.current = null;
        awayStartTime.current = null;
    }, []);

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.origin !== FOCUS_TRACKER_ORIGIN) return;
            if (e.data?.type !== "TAB_CHANGED") return;

            // running 중일 때만 카운트
            if (!running) return;

            const { url, blocked } = e.data;
            const now = Date.now();
            const isCurrentTab = url.startsWith(FOCUS_TRACKER_ORIGIN);

            // ref 업데이트는 setTabStats 밖에서 먼저 처리
            const isRapid =
                lastSwitchTime.current !== null &&
                now - lastSwitchTime.current < 3000;
            lastSwitchTime.current = now;

            // 탭 이탈 시간 계산
            let awaySeconds = 0;
            if (isCurrentTab && awayStartTime.current) {
                awaySeconds = Math.floor((now - awayStartTime.current) / 1000);
                awayStartTime.current = null;
            } else if (!isCurrentTab && !awayStartTime.current) {
                awayStartTime.current = now;
            }

            setTabStats((prev) => ({
                ...prev,
                tabSwitch: prev.tabSwitch + 1,
                rapidSwitch: isRapid ? prev.rapidSwitch + 1 : prev.rapidSwitch,
                blockedAccess: blocked
                    ? prev.blockedAccess + 1
                    : prev.blockedAccess,
                tabAway: prev.tabAway + awaySeconds,
            }));
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [running]); // running 바뀔 때마다 리스너 갱신

    return { tabStats, reset };
}
