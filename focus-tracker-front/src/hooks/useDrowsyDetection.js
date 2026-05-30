import { useCallback, useEffect, useRef, useState } from "react";
import { BlinkDetector } from "../lib/BlinkDetector";

// EAR 계산 (눈 종횡비)
function calculateEAR(landmarks, indices) {
    const p = (i) => landmarks[i];
    const topMidX = (p(indices[1]).x + p(indices[2]).x) / 2;
    const topMidY = (p(indices[1]).y + p(indices[2]).y) / 2;
    const botMidX = (p(indices[4]).x + p(indices[5]).x) / 2;
    const botMidY = (p(indices[4]).y + p(indices[5]).y) / 2;
    const horizontal = Math.hypot(
        p(indices[0]).x - p(indices[3]).x,
        p(indices[0]).y - p(indices[3]).y,
    );
    const vertical = Math.hypot(topMidX - botMidX, topMidY - botMidY);
    return horizontal === 0 ? 0 : vertical / horizontal;
}

// MAR 계산 (입 종횡비)
function calculateMAR(landmarks, indices) {
    const p = (i) => landmarks[i];
    const topMidX = (p(indices[0]).x + p(indices[1]).x) / 2;
    const topMidY = (p(indices[0]).y + p(indices[1]).y) / 2;
    const botMidX = (p(indices[2]).x + p(indices[3]).x) / 2;
    const botMidY = (p(indices[2]).y + p(indices[3]).y) / 2;
    const horizontal = Math.hypot(
        p(indices[4]).x - p(indices[5]).x,
        p(indices[4]).y - p(indices[5]).y,
    );
    const vertical = Math.hypot(topMidX - botMidX, topMidY - botMidY);
    return horizontal === 0 ? 0 : vertical / horizontal;
}

// 고개 기울기(roll) 계산
function calculateHeadTilt(landmarks) {
    const left = landmarks[234];
    const right = landmarks[454];
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    return Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
}

// 고개 방향(yaw) 근사 계산
function calculateHeadYaw(landmarks) {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeWidth = Math.abs(rightEye.x - leftEye.x);
    return eyeWidth === 0 ? 0 : ((nose.x - eyeCenterX) / eyeWidth) * 90;
}

// 랜드마크 인덱스
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const MOUTH = [13, 14, 17, 18, 78, 308];

// 임계값
const EAR_THRESHOLD = 0.2;
const MAR_THRESHOLD = 0.7;
const OPEN_MOUTH_FRAMES = 30;
const HEAD_TILT_THRESHOLD = 15;
const HEAD_TILT_FRAMES = 30;
const HEAD_TILT_ALERT_COUNT = 2;
const EYE_CLOSED_SECONDS = 0.5;
const FACE_ABSENCE_THRESHOLD = 10;
const HEAD_YAW_THRESHOLD = 45;
const HEAD_DIRECTION_ALERT_COUNT = 3;
// [추가] 고개 방향 쿨다운 — 브라우저 MediaPipe의 높은 fps로 인한 중복 카운트 방지
// 파이썬은 낮은 fps 덕분에 자연스럽게 방지되던 것을 브라우저 환경에서 명시적으로 보정
const HEAD_TURN_COOLDOWN = 1000; // ms

// noFace가 활성화된 모드
const NO_FACE_MODES = new Set(["강의", "잠금"]);

// 초기 result 상태
const INITIAL_RESULT = {
    ear: null,
    mar: null,
    blinkRate: 0,
    blinkCount: 0,
    blinkState: "MEASURING",
    eyesClosed: false,
    mouthOpen: false,
    headTiltCount: 0,
    headTilted: false,
    noFace: false,
    noFaceSeconds: 0,
    headTurnCount: 0,
    alert: false,
    totalSeconds: 0,
    focusSeconds: 0,
    nonFocusSeconds: 0,
    eyeClosedSeconds: 0,
    maxFocusSeconds: 0,
    // 점수 산출용 추가 값
    closedDuration: 0, // 현재 연속 눈 감김 지속 시간(초) — 파이썬 closed_duration 대응
    yawnCount: 0, // 누적 하품 횟수 — 파이썬 yawn_count 대응
    faceAbsenceDuration: 0, // 현재 연속 얼굴 부재 시간(초) — 파이썬 face_absence_duration 대응
};

// 초기 카운터 상태
const makeInitialCounters = () => ({
    eyeClosedStart: null,
    eyeClosedDrowsy: false,
    eyeClosedTotalSeconds: 0,
    closedDuration: 0, // 현재 연속 눈 감김 지속 시간(초)
    openMouthFrameCount: 0,
    yawnCount: 0, // 누적 하품 횟수
    yawnDetected: false,
    headTiltFrameCount: 0,
    headTiltCount: 0,
    headTiltTotal: 0,
    headTilted: false,
    faceAbsenceStart: null,
    faceAbsenceDuration: 0, // 현재 연속 얼굴 부재 시간(초)
    noFaceSeconds: 0,
    headTurnChanged: false,
    headTurnLastTime: 0, // [추가] 마지막 고개 방향 카운트 시각
    headTurnCount: 0,
    headTurnTotal: 0,
    startTime: null,
    lastFrameTime: null,
    focusSeconds: 0,
    nonFocusSeconds: 0,
    stoppedTotalSeconds: 0,
    maxFocusSeconds: 0,
    lastStartFocusSeconds: 0,
});

export function useDrowsyDetection(videoRef) {
    const [result, setResult] = useState(INITIAL_RESULT);
    const [error, setError] = useState(null);
    const [running, setRunning] = useState(false);

    const currentModeRef = useRef("강의");
    const detectorRef = useRef(new BlinkDetector());
    const faceMeshRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRef = useRef(null);
    const countersRef = useRef(makeInitialCounters());
    const closedRef = useRef(false);

    const stop = () => {
        closedRef.current = true;
        cameraRef.current?.stop();
        cameraRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setRunning(false);

        const c = countersRef.current;
        if (c.startTime !== null) {
            c.stoppedTotalSeconds += (Date.now() - c.startTime) / 1000;
            c.startTime = null;
        }

        // 구간 종료 — 이번 구간 집중 시간 계산 후 최댓값 갱신
        const segmentFocus = c.focusSeconds - c.lastStartFocusSeconds;
        c.maxFocusSeconds = Math.max(c.maxFocusSeconds, segmentFocus);
    };

    const closeFaceMesh = useCallback(() => {
        closedRef.current = true;
        cameraRef.current?.stop();
        cameraRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        faceMeshRef.current?.close();
        faceMeshRef.current = null;
    }, [videoRef]);

    const reset = () => {
        closeFaceMesh();
        setRunning(false);
        detectorRef.current = new BlinkDetector();
        countersRef.current = makeInitialCounters();
        setResult(INITIAL_RESULT);
        setError(null);
    };

    const loadScript = (src) =>
        new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`))
                return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });

    const start = async () => {
        stop();
        closedRef.current = false;

        setError(null);
        detectorRef.current = new BlinkDetector();

        const prev = countersRef.current;
        countersRef.current = {
            eyeClosedStart: null,
            eyeClosedDrowsy: false,
            eyeClosedTotalSeconds: prev.eyeClosedTotalSeconds ?? 0,
            closedDuration: 0,
            openMouthFrameCount: 0,
            yawnCount: prev.yawnCount ?? 0, // 세션 내 누적 유지
            yawnDetected: false,
            headTiltFrameCount: 0,
            headTiltCount: 0,
            headTiltTotal: prev.headTiltTotal ?? 0,
            headTilted: false,
            faceAbsenceStart: null,
            faceAbsenceDuration: 0,
            noFaceSeconds: prev.noFaceSeconds ?? 0,
            headTurnChanged: false,
            headTurnLastTime: 0,
            headTurnCount: 0,
            headTurnTotal: prev.headTurnTotal ?? 0,
            startTime: Date.now(),
            lastFrameTime: Date.now(),
            focusSeconds: prev.focusSeconds ?? 0,
            nonFocusSeconds: prev.nonFocusSeconds ?? 0,
            stoppedTotalSeconds: prev.stoppedTotalSeconds ?? 0,
            maxFocusSeconds: prev.maxFocusSeconds ?? 0,
            lastStartFocusSeconds: prev.focusSeconds ?? 0,
        };

        try {
            await loadScript(
                "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
            );
            await loadScript(
                "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
            );

            const FaceMesh = window.FaceMesh;
            const Camera = window.Camera;

            const faceMesh = new FaceMesh({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            faceMesh.onResults((res) => {
                if (closedRef.current) return;
                if (!faceMeshRef.current) return;

                const c = countersRef.current;
                const now = Date.now();
                const delta = c.lastFrameTime
                    ? (now - c.lastFrameTime) / 1000
                    : 0;
                c.lastFrameTime = now;
                const totalSeconds =
                    c.stoppedTotalSeconds + (now - c.startTime) / 1000;

                const noFaceActive = NO_FACE_MODES.has(currentModeRef.current);

                // 얼굴 미감지
                if (!res.multiFaceLandmarks?.length) {
                    c.closedDuration = 0; // 얼굴 없으면 눈 감김 초기화

                    if (noFaceActive) {
                        if (c.faceAbsenceStart === null)
                            c.faceAbsenceStart = now;
                        c.faceAbsenceDuration =
                            (now - c.faceAbsenceStart) / 1000;
                        c.noFaceSeconds += delta;

                        const noFaceAlert =
                            c.faceAbsenceDuration >= FACE_ABSENCE_THRESHOLD;
                        if (!noFaceAlert) c.focusSeconds += delta;
                        else c.nonFocusSeconds += delta;

                        setResult((prev) => ({
                            ...prev,
                            noFace: true,
                            noFaceSeconds: parseFloat(
                                c.noFaceSeconds.toFixed(1),
                            ),
                            faceAbsenceDuration: parseFloat(
                                c.faceAbsenceDuration.toFixed(1),
                            ),
                            closedDuration: 0,
                            alert: noFaceAlert,
                            totalSeconds: parseFloat(totalSeconds.toFixed(1)),
                            focusSeconds: parseFloat(c.focusSeconds.toFixed(1)),
                            nonFocusSeconds: parseFloat(
                                c.nonFocusSeconds.toFixed(1),
                            ),
                        }));
                    }
                    return;
                }

                // 얼굴 감지됨 — 얼굴 부재 초기화
                c.faceAbsenceStart = null;
                c.faceAbsenceDuration = 0;

                const landmarks = res.multiFaceLandmarks[0];
                const det = detectorRef.current;

                const ear =
                    (calculateEAR(landmarks, LEFT_EYE) +
                        calculateEAR(landmarks, RIGHT_EYE)) /
                    2;
                const mar = calculateMAR(landmarks, MOUTH);
                const tiltAngle = calculateHeadTilt(landmarks);
                const yaw = calculateHeadYaw(landmarks);

                det.update(ear);

                // 눈 감김 — closedDuration: 현재 연속 감김 시간
                if (ear < EAR_THRESHOLD) {
                    if (c.eyeClosedStart === null) c.eyeClosedStart = now;
                    c.closedDuration = (now - c.eyeClosedStart) / 1000;
                    if (c.closedDuration >= EYE_CLOSED_SECONDS)
                        c.eyeClosedDrowsy = true;
                } else {
                    c.eyeClosedStart = null;
                    c.eyeClosedDrowsy = false;
                    c.closedDuration = 0;
                }
                const eyesClosed = c.eyeClosedDrowsy;
                if (eyesClosed) c.eyeClosedTotalSeconds += delta;

                // 하품 — OPEN_MOUTH_FRAMES 이상 지속 시 1회 카운트
                if (mar > MAR_THRESHOLD) {
                    c.openMouthFrameCount++;
                    if (
                        c.openMouthFrameCount >= OPEN_MOUTH_FRAMES &&
                        !c.yawnDetected
                    ) {
                        c.yawnCount++;
                        c.yawnDetected = true;
                    }
                } else {
                    c.openMouthFrameCount = 0;
                    c.yawnDetected = false;
                }
                const mouthOpen = c.openMouthFrameCount >= OPEN_MOUTH_FRAMES;

                // 고개 기울기(roll) — 카운트만 유지 (집중/비집중 판단에서 제외)
                if (tiltAngle > HEAD_TILT_THRESHOLD) {
                    c.headTiltFrameCount++;
                    if (
                        c.headTiltFrameCount >= HEAD_TILT_FRAMES &&
                        !c.headTilted
                    ) {
                        c.headTilted = true;
                        c.headTiltCount++;
                        c.headTiltTotal++;
                    }
                } else {
                    c.headTiltFrameCount = 0;
                    c.headTilted = false;
                }

                // 고개 방향(yaw) — 쿨다운으로 중복 카운트 방지
                if (Math.abs(yaw) > HEAD_YAW_THRESHOLD) {
                    if (!c.headTurnChanged) {
                        c.headTurnChanged = true;
                        if (now - c.headTurnLastTime >= HEAD_TURN_COOLDOWN) {
                            c.headTurnCount++;
                            c.headTurnTotal++;
                            c.headTurnLastTime = now;
                        }
                    }
                } else {
                    c.headTurnChanged = false;
                }

                const tiltAlert = c.headTiltCount >= HEAD_TILT_ALERT_COUNT;
                const headTurnAlert =
                    c.headTurnCount > HEAD_DIRECTION_ALERT_COUNT;
                const blinkState = det.getState();

                if (tiltAlert) c.headTiltCount = 0;
                if (headTurnAlert) c.headTurnCount = 0;

                // alert — 집중도 모니터링 4개 항목 기준 (얼굴 부재는 얼굴 감지 블록 밖에서 처리)
                const alert =
                    eyesClosed || headTurnAlert || blinkState === "DROWSY";

                // 집중/비집중 판단 — 집중도 모니터링 항목과 동일한 기준
                const unfocused =
                    eyesClosed || headTurnAlert || blinkState === "DROWSY";

                if (!unfocused) c.focusSeconds += delta;
                else c.nonFocusSeconds += delta;

                setResult({
                    ear: parseFloat(ear.toFixed(3)),
                    mar: parseFloat(mar.toFixed(3)),
                    blinkRate: det.getBlinkRate(),
                    blinkCount: det.getBlinkCount(),
                    blinkState,
                    eyesClosed,
                    mouthOpen,
                    headTiltCount: c.headTiltTotal,
                    headTilted: c.headTilted,
                    noFace: false,
                    noFaceSeconds: parseFloat(c.noFaceSeconds.toFixed(1)),
                    headTurnCount: c.headTurnTotal,
                    alert,
                    totalSeconds: parseFloat(totalSeconds.toFixed(1)),
                    focusSeconds: parseFloat(c.focusSeconds.toFixed(1)),
                    nonFocusSeconds: parseFloat(c.nonFocusSeconds.toFixed(1)),
                    eyeClosedSeconds: parseFloat(
                        c.eyeClosedTotalSeconds.toFixed(1),
                    ),
                    maxFocusSeconds: parseFloat(c.maxFocusSeconds.toFixed(1)),
                    // 점수 산출용
                    closedDuration: parseFloat(c.closedDuration.toFixed(2)),
                    yawnCount: c.yawnCount,
                    faceAbsenceDuration: parseFloat(
                        c.faceAbsenceDuration.toFixed(1),
                    ),
                });
            });

            faceMeshRef.current = faceMesh;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (closedRef.current) return;
                    if (!faceMeshRef.current) return;
                    await faceMesh.send({ image: videoRef.current });
                },
                width: 640,
                height: 480,
            });

            await faceMesh.initialize();
            camera.start();
            cameraRef.current = camera;
            setRunning(true);
        } catch (e) {
            setError("웹캠 접근 권한이 필요합니다.");
            console.error(e);
        }
    };

    useEffect(() => () => closeFaceMesh(), [closeFaceMesh]);

    const setMode = useCallback((mode) => {
        currentModeRef.current = mode;
    }, []);

    return { result, error, running, start, stop, reset, setMode };
}
