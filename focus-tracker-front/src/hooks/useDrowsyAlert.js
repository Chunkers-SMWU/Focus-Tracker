import { useEffect, useRef, useState, useCallback } from "react";

const COOLDOWN_SECONDS = 30; // 경고 후 30초 쿨다운

// ==============================
// 모드별 기준/가중치 (파이썬 MODE_CONFIGS 대응)
// ==============================
const MODE_CONFIGS = {
    강의: {
        criteria: {
            // 브라우저
            "탭 이탈 누적시간": {
                source: "browser",
                key: "tabAway",
                threshold: 300,
                op: ">=",
            },
            "짧은 간격 반복전환": {
                source: "browser",
                key: "rapidSwitch",
                threshold: 1,
                op: ">=",
            },
            "허용되지 않은 창 접속": {
                source: "browser",
                key: "blockedAccess",
                threshold: 1,
                op: ">=",
            },
            // 웹캠
            "얼굴 부재": {
                source: "webcam",
                key: "faceAbsenceDuration",
                threshold: 10,
                op: ">",
            },
            "고개 방향": {
                source: "webcam",
                key: "headTurnCount",
                threshold: 3,
                op: ">",
            },
            "눈 감김": {
                source: "webcam",
                key: "closedDuration",
                threshold: 0.5,
                op: ">=",
            },
            "깜빡임 부족": {
                source: "webcam",
                key: "blinkRate",
                threshold: 8,
                op: "<",
            },
        },
        weights: {
            "탭 이탈 누적시간": 0.15,
            "짧은 간격 반복전환": 0.1,
            "허용되지 않은 창 접속": 0.15,
            "얼굴 부재": 0.15,
            "고개 방향": 0.15,
            "눈 감김": 0.2,
            "깜빡임 부족": 0.1,
        },
    },
    자료: {
        criteria: {
            "허용되지 않은 창 접속": {
                source: "browser",
                key: "blockedAccess",
                threshold: 1,
                op: ">=",
            },
            "고개 방향": {
                source: "webcam",
                key: "headTurnCount",
                threshold: 3,
                op: ">",
            },
            "눈 감김": {
                source: "webcam",
                key: "closedDuration",
                threshold: 0.5,
                op: ">=",
            },
            "깜빡임 부족": {
                source: "webcam",
                key: "blinkRate",
                threshold: 8,
                op: "<",
            },
        },
        weights: {
            "허용되지 않은 창 접속": 0.25,
            "고개 방향": 0.2,
            "눈 감김": 0.35,
            "깜빡임 부족": 0.2,
        },
    },
    잠금: {
        criteria: {
            "탭 전환 횟수": {
                source: "browser",
                key: "tabSwitch",
                threshold: 1,
                op: ">=",
            },
            "탭 이탈 누적시간": {
                source: "browser",
                key: "tabAway",
                threshold: 10,
                op: ">=",
            },
            "짧은 간격 반복전환": {
                source: "browser",
                key: "rapidSwitch",
                threshold: 1,
                op: ">=",
            },
            "허용되지 않은 창 접속": {
                source: "browser",
                key: "blockedAccess",
                threshold: 1,
                op: ">=",
            },
            하품: {
                source: "webcam",
                key: "yawnCount",
                threshold: 1,
                op: ">=",
            },
            "얼굴 부재": {
                source: "webcam",
                key: "faceAbsenceDuration",
                threshold: 10,
                op: ">=",
            },
            "고개 방향": {
                source: "webcam",
                key: "headTurnCount",
                threshold: 2,
                op: ">",
            },
            "눈 감김": {
                source: "webcam",
                key: "closedDuration",
                threshold: 0.5,
                op: ">=",
            },
            "깜빡임 부족": {
                source: "webcam",
                key: "blinkRate",
                threshold: 8,
                op: "<",
            },
        },
        weights: {
            "탭 전환 횟수": 0.1,
            "탭 이탈 누적시간": 0.1,
            "짧은 간격 반복전환": 0.1,
            "허용되지 않은 창 접속": 0.1,
            하품: 0.1,
            "얼굴 부재": 0.1,
            "고개 방향": 0.1,
            "눈 감김": 0.2,
            "깜빡임 부족": 0.1,
        },
    },
};

// ==============================
// 점수 산출 유틸 (파이썬 ratio_score / low_blink_score 대응)
// ==============================

/** 기준값 대비 0~100점 반환 */
function ratioScore(value, threshold) {
    if (threshold <= 0) return 0;
    return Math.min((value / threshold) * 100, 100);
}

/** 깜빡임 부족 점수 — 낮을수록 위험하므로 반전 산출 */
function lowBlinkScore(blinkRate, minRate, blinkValid) {
    if (!blinkValid) return 0;
    return Math.max(((minRate - blinkRate) / minRate) * 100, 0);
}

/** 적발 조건 판정 */
function isViolation(value, threshold, op) {
    if (op === ">=") return value >= threshold;
    if (op === ">") return value > threshold;
    if (op === "<=") return value <= threshold;
    if (op === "<") return value < threshold;
    return false;
}

/**
 * 통합 점수 산출 (파이썬 calculate_integrated_score 대응)
 * @returns {{ score: number, status: string, violations: string[], itemScores: object }}
 */
function calculateIntegratedScore(
    mode,
    result,
    tabStats,
    blinkValid,
    thresholds,
) {
    const config = MODE_CONFIGS[mode];
    if (!config)
        return { score: 0, status: "정상", violations: [], itemScores: {} };

    const userThresholds = thresholds ?? {};
    const itemScores = {};
    const violations = [];

    for (const [name, rule] of Object.entries(config.criteria)) {
        let threshold = rule.threshold;
        if (rule.source === "browser") {
            const userKey = rule.key;
            if (
                userThresholds[userKey] !== undefined &&
                userThresholds[userKey] !== null
            ) {
                threshold = userThresholds[userKey];
            }
        }

        const value =
            rule.source === "browser"
                ? (tabStats[rule.key] ?? 0)
                : (result[rule.key] ?? 0);

        let score, violated;

        if (name === "깜빡임 부족") {
            score = lowBlinkScore(value, threshold, blinkValid);
            violated = blinkValid && isViolation(value, threshold, rule.op);
        } else {
            score = ratioScore(value, threshold);
            violated = isViolation(value, threshold, rule.op);
        }

        itemScores[name] = score;
        if (violated) violations.push(name);
    }

    const totalScore = Object.entries(config.weights).reduce(
        (sum, [name, weight]) => sum + (itemScores[name] ?? 0) * weight,
        0,
    );

    let status;
    if (totalScore < 30) status = "정상";
    else if (totalScore < 50) status = "주의";
    else if (totalScore < 70) status = "경고";
    else status = "위험";

    return { score: totalScore, status, violations, itemScores };
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
 * @param {object}   tabStats    - useTabTracking tabStats (점수 산출용 누적값)
 * @param {object}   alertStats  - useTabTracking alertStats (팝업 판단용, 재시작마다 리셋)
 * @param {boolean}  running     - drowsy.running
 * @param {function} onRest      - 휴식하기 콜백
 * @param {object}   thresholds  - 사용자 설정 임계값
 * @param {string}   currentMode - 현재 모드
 * @param {function} onAlertStep - 경고 단계 변경 시 useDrowsyDetection에 전달하는 콜백
 */
export default function useDrowsyAlert(
    result,
    tabStats,
    alertStats,
    running,
    onRest,
    thresholds,
    currentMode,
    onAlertStep,
) {
    const [alertStep, setAlertStep] = useState(null);
    const [alertLog, setAlertLog] = useState([]);
    // 통합 점수 상태 — 외부 컴포넌트(MainPage 등)에서 사용 가능
    const [integratedScore, setIntegratedScore] = useState({
        score: 0,
        status: "정상",
        violations: [],
        itemScores: {},
    });

    const alertCountRef = useRef(0);
    const cooldownRef = useRef(false);
    const cooldownTimer = useRef(null);
    // 재시작 시점 웹캠 누적값 스냅샷 — 팝업 판단 시 증가분만 사용
    const webcamSnapshotRef = useRef({});

    // 최신값을 ref로 관리 — interval 재등록 없이 참조
    const resultRef = useRef(result);
    const tabStatsRef = useRef(tabStats);
    const alertStatsRef = useRef(alertStats);
    const runningRef = useRef(running);
    const thresholdsRef = useRef(thresholds);
    const currentModeRef = useRef(currentMode);
    const onAlertStepRef = useRef(onAlertStep);

    useEffect(() => {
        resultRef.current = result;
    }, [result]);
    useEffect(() => {
        tabStatsRef.current = tabStats;
    }, [tabStats]);
    useEffect(() => {
        alertStatsRef.current = alertStats;
    }, [alertStats]);
    useEffect(() => {
        runningRef.current = running;
    }, [running]);
    useEffect(() => {
        thresholdsRef.current = thresholds;
    }, [thresholds]);
    useEffect(() => {
        currentModeRef.current = currentMode;
    }, [currentMode]);
    useEffect(() => {
        onAlertStepRef.current = onAlertStep;
    }, [onAlertStep]);

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
        (violations) => {
            alertCountRef.current += 1;
            const step = Math.min(alertCountRef.current, 3);

            if (step >= 2) playAlertSound(getVolume());

            setAlertLog((prev) => [
                ...prev,
                {
                    step,
                    triggeredItems: violations,
                    timestamp: new Date().toISOString(),
                },
            ]);

            setAlertStep(step);
            onAlertStepRef.current?.(step); // useDrowsyDetection에 단계 전달

            startCooldown();
        },
        [startCooldown],
    );

    const handleContinue = useCallback(() => {
        setAlertStep(null);
        onAlertStepRef.current?.(null);
    }, []);

    const handleRest = useCallback(
        (restMinutes) => {
            setAlertStep(null);
            onAlertStepRef.current?.(null);
            onRest(restMinutes);
        },
        [onRest],
    );

    /** 휴식 후 재시작 시 — 단계만 리셋, alertLog 유지, 웹캠 누적값 스냅샷 갱신 */
    const resetAlertCount = useCallback(() => {
        alertCountRef.current = 0;
        cooldownRef.current = false;
        clearTimeout(cooldownTimer.current);
        setAlertStep(null);
        onAlertStepRef.current?.(null);
        // 재시작 시점의 웹캠 누적값 스냅샷 저장
        const r = resultRef.current;
        webcamSnapshotRef.current = {
            headTurnCount: r.headTurnCount ?? 0,
            yawnCount: r.yawnCount ?? 0,
        };
    }, []);

    /** 세션 완전 초기화 시 — 단계 + log 전부 리셋 */
    const resetAlert = useCallback(() => {
        alertCountRef.current = 0;
        cooldownRef.current = false;
        clearTimeout(cooldownTimer.current);
        setAlertStep(null);
        onAlertStepRef.current?.(null);
        setAlertLog([]);
        webcamSnapshotRef.current = {};
        setIntegratedScore({
            score: 0,
            status: "정상",
            violations: [],
            itemScores: {},
        });
    }, []);

    // 1초마다 점수 산출 + 경고 판단
    useEffect(() => {
        const id = setInterval(() => {
            if (!runningRef.current) return;

            const r = resultRef.current;
            // 파이썬 BLINK_WARMUP_SEC(30초) 대응 — 세션 경과 시간 30초 이상 + 첫 깜빡임 감지 후 유효
            const blinkValid =
                r.blinkState !== "MEASURING" && r.totalSeconds >= 30;

            // 점수 산출 — tabStats(누적값) 기준
            const scoreResult = calculateIntegratedScore(
                currentModeRef.current,
                r,
                tabStatsRef.current,
                blinkValid,
                thresholdsRef.current,
            );
            setIntegratedScore(scoreResult);

            // 팝업 경고 판단 — alertStats(재시작마다 리셋) + 웹캠 증가분 기준
            if (cooldownRef.current) return;

            const snap = webcamSnapshotRef.current;
            const alertResult = calculateIntegratedScore(
                currentModeRef.current,
                {
                    ...r,
                    headTurnCount: Math.max(
                        (r.headTurnCount ?? 0) - (snap.headTurnCount ?? 0),
                        0,
                    ),
                    yawnCount: Math.max(
                        (r.yawnCount ?? 0) - (snap.yawnCount ?? 0),
                        0,
                    ),
                },
                alertStatsRef.current,
                blinkValid,
                thresholdsRef.current,
            );

            if (alertResult.violations.length >= 2) {
                triggerAlert(alertResult.violations);
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
        integratedScore, // { score, status, violations, itemScores }
        handleContinue,
        handleRest,
        resetAlert,
        resetAlertCount,
    };
}
