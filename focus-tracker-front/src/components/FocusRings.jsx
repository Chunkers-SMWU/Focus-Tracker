import { useMemo } from "react";
import styles from "./FocusRings.module.css";

// 모드별 지표 활성화 여부
const MODE_CONFIG = {
    강의: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
    자료: { noFace: false, headTurn: true, eyeClosed: true, blink: true },
    잠금: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
};

// 링 메타데이터 — 파이썬 threshold 기준
function buildMetrics(result, currentMode) {
    const cfg = MODE_CONFIG[currentMode] ?? MODE_CONFIG["강의"];
    return [
        {
            key: "headTurn",
            label: "고개 방향",
            value: result?.headTurnCount ?? null,
            max: currentMode === "잠금" ? 3 : 4, // 잠금 threshold 2 초과, 강의/자료 threshold 3 초과
            active: cfg.headTurn,
        },
        {
            key: "noFace",
            label: "얼굴 부재",
            value: result?.faceAbsenceDuration ?? null,
            max: 10,
            active: cfg.noFace,
        },
        {
            key: "eyeClosed",
            label: "눈 감김",
            value: result?.closedDuration ?? null,
            max: 0.5,
            active: cfg.eyeClosed,
        },
        {
            key: "blink",
            label: "깜빡임",
            value: result?.blinkRate ?? 0,
            max: 8, // 파이썬 threshold 8 기준
            active: cfg.blink,
            lowIsBad: true, // 낮을수록 링이 차오름
        },
    ];
}

// 링 색상 결정 — integratedScore.itemScores 기반
function getColor(metric, itemScores) {
    if (!metric.active) return { ring: "#e5e5e5", text: "#bbb" };
    if (!itemScores) return { ring: "#d1d5db", text: "#9ca3af" };

    const KEY_MAP = {
        noFace: "얼굴 부재",
        headTurn: "고개 방향",
        eyeClosed: "눈 감김",
        blink: "깜빡임 부족",
    };
    const scoreKey = KEY_MAP[metric.key];
    const score = itemScores[scoreKey];

    if (score === undefined) return { ring: "#e5e5e5", text: "#bbb" };

    if (score < 30) return { ring: "#22c55e", text: "#22c55e" };
    if (score < 50) return { ring: "#f97316", text: "#f97316" };
    return { ring: "#ef4444", text: "#ef4444" };
}

// 채움 비율 계산
function getFillRatio(metric) {
    if (!metric.active || metric.value === null) return 0;
    const ratio = metric.value / metric.max;
    if (metric.lowIsBad) return Math.min(Math.max(1 - ratio, 0), 1);
    return Math.min(Math.max(ratio, 0), 1);
}

const RING_SIZE = 200;
const RING_RADIUS = 76;
const RING_STROKE = 11;
const RING_FONT_VALUE = 26;
const RING_FONT_LABEL = 15;

function Ring({ metric, itemScores }) {
    const size = RING_SIZE;
    const r = RING_RADIUS;
    const sw = RING_STROKE;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const color = getColor(metric, itemScores);
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

export default function FocusRings({ result, currentMode, integratedScore }) {
    const metrics = useMemo(
        () => buildMetrics(result, currentMode),
        [result, currentMode],
    );
    const itemScores = integratedScore?.itemScores ?? null;

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>집중도 모니터링</div>
            <div className={styles.grid}>
                {metrics.map((m) => (
                    <Ring key={m.key} metric={m} itemScores={itemScores} />
                ))}
            </div>
        </div>
    );
}
