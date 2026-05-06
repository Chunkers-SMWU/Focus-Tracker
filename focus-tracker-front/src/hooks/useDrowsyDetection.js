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
const CLOSED_EYES_FRAMES = 30;
const MAR_THRESHOLD = 0.7;
const OPEN_MOUTH_FRAMES = 30;
const HEAD_TILT_THRESHOLD = 15;
const HEAD_TILT_FRAMES = 30;
const HEAD_TILT_ALERT_COUNT = 2;

export function useDrowsyDetection(videoRef) {
    const [result, setResult] = useState({
        ear: null,
        mar: null,
        blinkRate: 0,
        blinkCount: 0,
        blinkState: "MEASURING",
        eyesClosed: false,
        mouthOpen: false,
        headTiltCount: 0,
        alert: false,
        // 추가
        totalSeconds: 0,
        focusSeconds: 0,
    });
    const [error, setError] = useState(null);
    const [running, setRunning] = useState(false);

    const detectorRef = useRef(new BlinkDetector());
    const faceMeshRef = useRef(null);
    const streamRef = useRef(null);
    const cameraRef = useRef(null);

    const countersRef = useRef({
        closedEyesFrameCount: 0,
        openMouthFrameCount: 0,
        headTiltFrameCount: 0,
        headTiltCount: 0,
        headTilted: false,
        // 추가
        startTime: null,
        lastFrameTime: null,
        focusSeconds: 0,
    });

    const stop = () => {
        cameraRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        faceMeshRef.current?.close();
        setRunning(false);
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
        setError(null);
        detectorRef.current = new BlinkDetector();

        // 이전 누적값 보존
        const prev = countersRef.current;
        countersRef.current = {
            closedEyesFrameCount: 0,
            openMouthFrameCount: 0,
            headTiltFrameCount: 0,
            headTiltCount: 0,
            headTilted: false,
            // startTime은 최초 1회만 설정
            startTime: prev.startTime ?? Date.now(),
            lastFrameTime: Date.now(),
            // focusSeconds 누적 이어받기
            focusSeconds: prev.focusSeconds ?? 0,
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

                if (ear < EAR_THRESHOLD) {
                    c.closedEyesFrameCount++;
                } else {
                    c.closedEyesFrameCount = 0;
                }
                if (mar > MAR_THRESHOLD) {
                    c.openMouthFrameCount++;
                } else {
                    c.openMouthFrameCount = 0;
                }

                if (tiltAngle > HEAD_TILT_THRESHOLD) {
                    c.headTiltFrameCount++;
                    if (
                        c.headTiltFrameCount >= HEAD_TILT_FRAMES &&
                        !c.headTilted
                    ) {
                        c.headTilted = true;
                        c.headTiltCount++;
                    }
                } else {
                    c.headTiltFrameCount = 0;
                    c.headTilted = false;
                }

                const eyesClosed = c.closedEyesFrameCount >= CLOSED_EYES_FRAMES;
                const mouthOpen = c.openMouthFrameCount >= OPEN_MOUTH_FRAMES;
                const tiltAlert = c.headTiltCount >= HEAD_TILT_ALERT_COUNT;
                const blinkState = det.getState();

                if (tiltAlert) c.headTiltCount = 0;

                const alert =
                    eyesClosed ||
                    mouthOpen ||
                    tiltAlert ||
                    blinkState === "DROWSY";

                // 시간 누적
                const now = Date.now();
                const delta = (now - c.lastFrameTime) / 1000;
                c.lastFrameTime = now;
                const totalSeconds = (now - c.startTime) / 1000;
                if (!alert) c.focusSeconds += delta;

                setResult({
                    ear: parseFloat(ear.toFixed(3)),
                    mar: parseFloat(mar.toFixed(3)),
                    blinkRate: det.getBlinkRate(),
                    blinkCount: det.getBlinkCount(),
                    blinkState,
                    eyesClosed,
                    mouthOpen,
                    headTiltCount: c.headTiltCount,
                    alert,
                    // 추가
                    totalSeconds: parseFloat(totalSeconds.toFixed(1)),
                    focusSeconds: parseFloat(c.focusSeconds.toFixed(1)),
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

    useEffect(() => () => stop(), []);

    return { result, error, running, start, stop };
}
