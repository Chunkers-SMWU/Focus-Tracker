import { useMemo } from "react";
import styles from "./FocusRings.module.css";

// 모드별 지표 활성화 여부
const MODE_CONFIG = {
    강의: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
    자료: { noFace: false, headTurn: true, eyeClosed: true, blink: true },
    잠금: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
};

// 링 메타데이터
function buildMetrics(result, currentMode) {
    const cfg = MODE_CONFIG[currentMode] ?? MODE_CONFIG["강의"];
    return [
        {
            key: "noFace",
            label: "얼굴 부재",
            value: result?.noFaceSeconds ?? null,
            max: 60,
            active: cfg.noFace,
            thresholds: { warn: 10, danger: 20 },
            inverse: true,
        },
        {
            key: "headTurn",
            label: "고개 방향",
            value: result?.headTurnCount ?? null,
            max: 6,
            active: cfg.headTurn,
            thresholds: { warn: 2, danger: 3 },
            inverse: true,
        },
        {
            key: "eyeClosed",
            label: "눈 감김",
            value: result?.eyeClosedSeconds ?? null,
            max: 30,
            active: cfg.eyeClosed,
            thresholds: { warn: 3, danger: 10 },
            inverse: true,
        },
        {
            key: "blink",
            label: "깜빡임",
            value: result?.blinkRate ?? 0,
            max: 15,
            active: cfg.blink,
            thresholds: { warn: 10, danger: 8 },
            inverse: false,
            lowIsBad: true,
        },
    ];
}

// 색상 결정
function getColor(metric) {
    if (!metric.active) return { ring: "#e5e5e5", text: "#bbb" };
    const v = metric.value;
    if (v === null) return { ring: "#d1d5db", text: "#9ca3af" };
    const { warn, danger } = metric.thresholds;
    let isWarn, isDanger;
    if (metric.lowIsBad) {
        isDanger = v < danger;
        isWarn = !isDanger && v < warn;
    } else if (metric.inverse) {
        isDanger = v >= danger;
        isWarn = !isDanger && v >= warn;
    } else {
        isDanger = v < danger;
        isWarn = !isDanger && v < warn;
    }
    if (isDanger) return { ring: "#ef4444", text: "#ef4444" };
    if (isWarn) return { ring: "#f97316", text: "#f97316" };
    return { ring: "#22c55e", text: "#22c55e" };
}

// 채움 비율 계산
function getFillRatio(metric) {
    if (!metric.active || metric.value === null) return 0;
    return Math.min(Math.max(metric.value / metric.max, 0), 1);
}

// 링 크기 고정값
const RING_SIZE = 200;
const RING_RADIUS = 76;
const RING_STROKE = 11;
const RING_FONT_VALUE = 26;
const RING_FONT_LABEL = 15;

// SVG 링 컴포넌트
function Ring({ metric }) {
    const size = RING_SIZE;
    const r = RING_RADIUS;
    const sw = RING_STROKE;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const color = getColor(metric);
    const dashOffset = circumference * (1 - getFillRatio(metric));
    const displayVal = (() => {
        if (metric.value === null) return "—";
        if (metric.key === "eyeClosed" || metric.key === "noFace") {
            const total = Math.floor(metric.value);
            const m = Math.floor(total / 60);
            const s = total % 60;
            return `${m}:${String(s).padStart(2, "0")}`;
        }
        if (metric.key === "blink") return `${metric.value}회/분`;
        if (metric.key === "headTurn") return `${metric.value}회`;
        return `${metric.value}`;
    })();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
            }}
        >
            <div style={{ position: "relative", width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ transform: "rotate(-90deg)" }}
                >
                    <circle
                        cx={c}
                        cy={c}
                        r={r}
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth={sw}
                    />
                    <circle
                        cx={c}
                        cy={c}
                        r={r}
                        fill="none"
                        stroke={color.ring}
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition:
                                "stroke-dashoffset 0.6s ease, stroke 0.4s ease",
                        }}
                    />
                </svg>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: RING_FONT_VALUE,
                        fontWeight: 700,
                        color: color.text,
                        lineHeight: 1,
                    }}
                >
                    {displayVal}
                </div>
            </div>
            <span
                style={{
                    fontSize: RING_FONT_LABEL,
                    color: "#999",
                    textAlign: "center",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                }}
            >
                {metric.label}
            </span>
        </div>
    );
}

// 메인 컴포넌트
export default function FocusRings({ result, currentMode }) {
    const metrics = useMemo(
        () => buildMetrics(result, currentMode),
        [result, currentMode],
    );

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>집중도 모니터링</div>
            <div className={styles.grid}>
                {metrics.map((m) => (
                    <Ring key={m.key} metric={m} />
                ))}
            </div>
        </div>
    );
}
