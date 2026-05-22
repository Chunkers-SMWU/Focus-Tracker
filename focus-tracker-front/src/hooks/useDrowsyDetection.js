import { useEffect, useRef, useState } from "react";
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

// 고개 기울기 계산
function calculateHeadTilt(landmarks) {
    const left = landmarks[234];
    const right = landmarks[454];
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    return Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
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
    alert: false,
    totalSeconds: 0,
    focusSeconds: 0,
    nonFocusSeconds: 0,
    eyeClosedSeconds: 0,
};

// 초기 카운터 상태
const makeInitialCounters = () => ({
    eyeClosedStart: null,
    eyeClosedDrowsy: false,
    eyeClosedTotalSeconds: 0,
    openMouthFrameCount: 0,
    headTiltFrameCount: 0,
    headTiltCount: 0, // 경고 판단용 (리셋됨)
    headTiltTotal: 0, // 누적 카운터 (리셋 안 됨)
    headTilted: false,
    startTime: null,
    lastFrameTime: null,
    focusSeconds: 0,
    nonFocusSeconds: 0,
    stoppedTotalSeconds: 0,
});

export function useDrowsyDetection(videoRef) {
    const [result, setResult] = useState(INITIAL_RESULT);
    const [error, setError] = useState(null);
    const [running, setRunning] = useState(false);

    const detectorRef = useRef(new BlinkDetector());
    const faceMeshRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRef = useRef(null);
    const countersRef = useRef(makeInitialCounters());
    const closedRef = useRef(false); // 세션 종료 플래그

    const stop = () => {
        closedRef.current = true; // onFrame/onResults 루프 즉시 차단
        cameraRef.current?.stop();
        cameraRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        // 중지 시 faceMesh는 close하지 않고 재사용 (close/send 충돌 방지)
        setRunning(false);

        const c = countersRef.current;
        if (c.startTime !== null) {
            c.stoppedTotalSeconds += (Date.now() - c.startTime) / 1000;
            c.startTime = null;
        }
    };

    // faceMesh까지 완전히 종료 (세션 종료 / 초기화 / 언마운트 시)
    const closeFaceMesh = () => {
        closedRef.current = true;
        cameraRef.current?.stop();
        cameraRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        faceMeshRef.current?.close();
        faceMeshRef.current = null;
    };

    // 모든 값 초기화
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
        closedRef.current = false; // 새 세션 시작 — 플래그 초기화

        setError(null);
        detectorRef.current = new BlinkDetector();

        const prev = countersRef.current;
        countersRef.current = {
            eyeClosedStart: null,
            eyeClosedDrowsy: false,
            eyeClosedTotalSeconds: prev.eyeClosedTotalSeconds ?? 0,
            openMouthFrameCount: 0,
            headTiltFrameCount: 0,
            headTiltCount: 0,
            headTiltTotal: prev.headTiltTotal ?? 0,
            headTilted: false,
            startTime: Date.now(),
            lastFrameTime: Date.now(),
            focusSeconds: prev.focusSeconds ?? 0,
            nonFocusSeconds: prev.nonFocusSeconds ?? 0,
            stoppedTotalSeconds: prev.stoppedTotalSeconds ?? 0,
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
                if (closedRef.current) return; // 세션 종료 후 콜백 무시
                if (!faceMeshRef.current) return;
                if (!res.multiFaceLandmarks?.length) return;

                const landmarks = res.multiFaceLandmarks[0];
                const c = countersRef.current;
                const det = detectorRef.current;

                // EAR / MAR / 고개 기울기
                const ear =
                    (calculateEAR(landmarks, LEFT_EYE) +
                        calculateEAR(landmarks, RIGHT_EYE)) /
                    2;
                const mar = calculateMAR(landmarks, MOUTH);
                const tiltAngle = calculateHeadTilt(landmarks);

                det.update(ear);

                const now = Date.now();
                const delta = (now - c.lastFrameTime) / 1000;
                c.lastFrameTime = now;
                // 이전 중지 누적 + 현재 세션 시간
                const totalSeconds =
                    c.stoppedTotalSeconds + (now - c.startTime) / 1000;

                // 눈 감김 — 시간 기반
                if (ear < EAR_THRESHOLD) {
                    if (c.eyeClosedStart === null)
                        c.eyeClosedStart = Date.now();
                    const elapsed = (Date.now() - c.eyeClosedStart) / 1000;
                    if (elapsed >= EYE_CLOSED_SECONDS) c.eyeClosedDrowsy = true;
                } else {
                    c.eyeClosedStart = null;
                    c.eyeClosedDrowsy = false;
                }
                const eyesClosed = c.eyeClosedDrowsy;
                if (eyesClosed) c.eyeClosedTotalSeconds += delta;

                // 하품
                if (mar > MAR_THRESHOLD) {
                    c.openMouthFrameCount++;
                } else {
                    c.openMouthFrameCount = 0;
                }
                const mouthOpen = c.openMouthFrameCount >= OPEN_MOUTH_FRAMES;

                // 고개 기울기
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

                const tiltAlert = c.headTiltCount >= HEAD_TILT_ALERT_COUNT;
                const blinkState = det.getState();

                if (tiltAlert) c.headTiltCount = 0;

                const alert =
                    eyesClosed ||
                    mouthOpen ||
                    tiltAlert ||
                    blinkState === "DROWSY";

                // 집중 시간 누적
                const unfocused = alert || c.headTilted;
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
                    alert,
                    totalSeconds: parseFloat(totalSeconds.toFixed(1)),
                    focusSeconds: parseFloat(c.focusSeconds.toFixed(1)),
                    nonFocusSeconds: parseFloat(c.nonFocusSeconds.toFixed(1)),
                    eyeClosedSeconds: parseFloat(
                        c.eyeClosedTotalSeconds.toFixed(1),
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
                    if (closedRef.current) return; // 세션 종료 후 루프 차단
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

    useEffect(() => () => closeFaceMesh(), []);

    return { result, error, running, start, stop, reset };
}
