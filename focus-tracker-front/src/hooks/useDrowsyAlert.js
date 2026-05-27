import { useEffect, useRef, useState, useCallback } from "react";
import { modeData } from "../data/modeData";

const SUSTAIN_THRESHOLD = 3; // 3초 지속 시 경고 발동
const COOLDOWN_SECONDS = 30; // 경고 후 30초 쿨다운

/** 감지 항목 목록 반환 (리포트용 기록에도 사용) */
function getTriggeredItems(result, tabStats, thresholds, currentMode) {
    const items = [];
    if (result.eyesClosed) items.push("눈 감김");
    if (result.mouthOpen) items.push("하품");
    if (result.blinkState === "LOW_FOCUS" || result.blinkState === "DROWSY")
        items.push("깜빡임 이상");
    if (result.headTilted) items.push("고개 방향 이탈");
    if (result.noFace) items.push("얼굴 부재");

    // 탭 관련 — modeData 기본값 기준, 사용자 설정값 우선 적용
    // modeData의 values가 null이면 해당 항목 비활성
    const defaults = modeData[currentMode]?.values ?? {};
    const ts = thresholds ?? {};

    const getThreshold = (key) => {
        if (ts[key] !== undefined) return ts[key]; // 사용자 설정값 우선
        return defaults[key]; // 없으면 modeData 기본값
    };

    const tTabSwitch = getThreshold("tabSwitch");
    const tTabAway = getThreshold("tabAway");
    const tRapidSwitch = getThreshold("rapidSwitch");
    const tBlockedAccess = getThreshold("blockedAccess");

    if (tTabSwitch !== null && tabStats.tabSwitch >= tTabSwitch)
        items.push("탭 전환");
    if (tTabAway !== null && tabStats.tabAway >= tTabAway)
        items.push("탭 이탈");
    if (tRapidSwitch !== null && tabStats.rapidSwitch >= tRapidSwitch)
        items.push("빠른 반복 전환");
    if (tBlockedAccess !== null && tabStats.blockedAccess >= tBlockedAccess)
        items.push("차단 사이트 접속");

    return items;
}

/** Web Audio API로 경고음 재생 */
function playAlertSound(volume) {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = volume / 100;
        osc.frequency.value = 880;
        osc.type = "sine";
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
        osc.onended = () => ctx.close();
    } catch (e) {
        console.warn("경고음 재생 실패:", e);
    }
}

/**
 * useDrowsyAlert
 * @param {object}   result      - useDrowsyDetection result
 * @param {object}   tabStats    - useTabTracking tabStats
 * @param {boolean}  running     - drowsy.running
 * @param {function} onRest      - 휴식하기 콜백
 * @param {object}   thresholds  - 사용자 설정 임계값
 * @param {string}   currentMode - 현재 모드
 */
export default function useDrowsyAlert(
    result,
    tabStats,
    running,
    onRest,
    thresholds,
    currentMode,
) {
    const [alertStep, setAlertStep] = useState(null);
    const [alertLog, setAlertLog] = useState([]);

    const alertCountRef = useRef(0);
    const sustainRef = useRef(0);
    const cooldownRef = useRef(false);
    const cooldownTimer = useRef(null);

    // result, tabStats, running, thresholds, currentMode를 ref로 관리
    // interval 재등록 없이 최신값 참조
    const resultRef = useRef(result);
    const tabStatsRef = useRef(tabStats);
    const runningRef = useRef(running);
    const thresholdsRef = useRef(thresholds);
    const currentModeRef = useRef(currentMode);

    useEffect(() => {
        resultRef.current = result;
    }, [result]);
    useEffect(() => {
        tabStatsRef.current = tabStats;
    }, [tabStats]);
    useEffect(() => {
        runningRef.current = running;
    }, [running]);
    useEffect(() => {
        thresholdsRef.current = thresholds;
    }, [thresholds]);
    useEffect(() => {
        currentModeRef.current = currentMode;
    }, [currentMode]);

    const getVolume = () => {
        const v = localStorage.getItem("focusAlertVolume");
        return v !== null ? Number(v) : 70;
    };

    const startCooldown = useCallback(() => {
        cooldownRef.current = true;
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = setTimeout(() => {
            cooldownRef.current = false;
        }, COOLDOWN_SECONDS * 1000);
    }, []);

    const triggerAlert = useCallback(
        (triggeredItems) => {
            alertCountRef.current += 1;
            const step = Math.min(alertCountRef.current, 3);

            if (step >= 2) playAlertSound(getVolume());

            setAlertLog((prev) => [
                ...prev,
                { step, triggeredItems, timestamp: new Date().toISOString() },
            ]);
            setAlertStep(step);
            startCooldown();
            sustainRef.current = 0;
        },
        [startCooldown],
    );

    const handleContinue = useCallback(() => {
        setAlertStep(null);
    }, []);

    const handleRest = useCallback(
        (restMinutes) => {
            setAlertStep(null);
            onRest(restMinutes);
        },
        [onRest],
    );

    /** 휴식 후 재시작 시 — 단계만 리셋, alertLog는 유지 */
    const resetAlertCount = useCallback(() => {
        alertCountRef.current = 0;
        sustainRef.current = 0;
        cooldownRef.current = false;
        clearTimeout(cooldownTimer.current);
        setAlertStep(null);
    }, []);

    /** 세션 완전 초기화 시 — 단계 + log 전부 리셋 */
    const resetAlert = useCallback(() => {
        alertCountRef.current = 0;
        sustainRef.current = 0;
        cooldownRef.current = false;
        clearTimeout(cooldownTimer.current);
        setAlertStep(null);
        setAlertLog([]);
    }, []);

    // interval은 마운트 시 한 번만 등록 — 최신값은 ref로 참조
    useEffect(() => {
        const id = setInterval(() => {
            if (!runningRef.current || cooldownRef.current) return;

            const items = getTriggeredItems(
                resultRef.current,
                tabStatsRef.current,
                thresholdsRef.current,
                currentModeRef.current,
            );
            if (items.length >= 2) {
                sustainRef.current += 1;
                if (sustainRef.current >= SUSTAIN_THRESHOLD) {
                    triggerAlert(items);
                }
            } else {
                sustainRef.current = 0;
            }
        }, 1000);

        return () => clearInterval(id);
    }, [triggerAlert]);

    useEffect(() => {
        return () => clearTimeout(cooldownTimer.current);
    }, []);

    return {
        alertStep,
        alertLog,
        handleContinue,
        handleRest,
        resetAlert,
        resetAlertCount,
    };
}
