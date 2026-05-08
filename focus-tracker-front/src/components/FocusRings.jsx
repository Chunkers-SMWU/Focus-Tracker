import { useMemo } from "react";

// ── 모드별 지표 활성화 여부 ──
const MODE_CONFIG = {
    강의: {
        noFace: true,
        headTurn: true,
        eyeClosed: true,
        blink: true,
        headNod: true,
    },
    자료: {
        noFace: false,
        headTurn: true,
        eyeClosed: true,
        blink: true,
        headNod: true,
    },
    잠금: {
        noFace: true,
        headTurn: true,
        eyeClosed: true,
        blink: true,
        headNod: true,
    },
    휴식: {
        noFace: false,
        headTurn: false,
        eyeClosed: false,
        blink: false,
        headNod: false,
    },
};

// ── 링 메타데이터 ───
function buildMetrics(result, currentMode) {
    const cfg = MODE_CONFIG[currentMode] ?? MODE_CONFIG["강의"];
    const blinkRate = result?.blinkRate ?? 0;
    const headTiltCount = result?.headTiltCount ?? 0;

    return [
        {
            key: "noFace",
            label: "얼굴 부재",
            value: null,
            max: 60,
            unit: "초",
            active: cfg.noFace,
            thresholds: { warn: 10, danger: 20 },
            inverse: true,
        },
        {
            key: "headTurn",
            label: "고개 방향",
            value: headTiltCount,
            max: 6,
            unit: "회",
            active: cfg.headTurn,
            thresholds: { warn: 2, danger: 3 },
            inverse: true,
        },
        {
            key: "eyeClosed",
            label: "눈 감김",
            value: null,
            max: 30,
            unit: "초",
            active: cfg.eyeClosed,
            thresholds: { warn: 3, danger: 10 },
            inverse: true,
        },
        {
            key: "blink",
            label: "깜빡임",
            value: blinkRate,
            max: 15,
            unit: "회/분",
            active: cfg.blink,
            thresholds: { warn: 10, danger: 8 },
            inverse: false,
            lowIsBad: true,
        },
        {
            key: "headNod",
            label: "고개 숙임",
            value: null,
            max: 6,
            unit: "회",
            active: cfg.headNod,
            thresholds: { warn: 2, danger: 3 },
            inverse: true,
        },
    ];
}

// ── 색상 결정 ────
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

// ── 채움 비율 계산 ────
function getFillRatio(metric) {
    if (!metric.active || metric.value === null) return 0;
    return Math.min(Math.max(metric.value / metric.max, 0), 1);
}

// ── 종합 집중도 계산 ──
function calcOverall(metrics, result) {
    const active = metrics.filter((m) => m.active && m.value !== null);
    const scores = active.map((m) => {
        const c = getColor(m);
        if (c.ring === "#ef4444") return 0;
        if (c.ring === "#f97316") return 50;
        return 100;
    });
    const base =
        scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 100;
    const penalties =
        (result?.eyesClosed ? 20 : 0) +
        (result?.mouthOpen ? 15 : 0) +
        (result?.alert ? 10 : 0) +
        (result?.blinkState === "DROWSY" ? 20 : 0) +
        (result?.blinkState === "LOW_FOCUS" ? 10 : 0);
    return Math.max(0, base - penalties);
}

// ── 링 size 고정값 ──
const RING_SIZE = 130;

// ── SVG 링 컴포넌트 ───
function Ring({ metric, size = RING_SIZE }) {
    const r = size * 0.37;
    const sw = size * 0.07;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const color = getColor(metric);
    const dashOffset = circumference * (1 - getFillRatio(metric));
    const displayVal =
        metric.value !== null
            ? `${metric.value}${metric.unit === "%" ? "%" : ""}`
            : "—";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
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
                        fontSize: size * 0.15,
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
                    fontSize: Math.max(size * 0.13, 9),
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

// ── 종합 링 ────
function OverallRing({ score, size = RING_SIZE }) {
    const r = size * 0.37;
    const sw = size * 0.08;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - (score !== null ? score / 100 : 0));
    const color =
        score === null
            ? "#d1d5db"
            : score >= 80
              ? "#22c55e"
              : score >= 50
                ? "#f97316"
                : "#ef4444";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
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
                        stroke={color}
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
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
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                    }}
                >
                    <span
                        style={{
                            fontSize: size * 0.18,
                            fontWeight: 800,
                            color,
                            lineHeight: 1,
                        }}
                    >
                        {score !== null ? `${score}` : "—"}
                    </span>
                    {score !== null && (
                        <span style={{ fontSize: size * 0.11, color: "#bbb" }}>
                            / 100
                        </span>
                    )}
                </div>
            </div>
            <span
                style={{
                    fontSize: Math.max(size * 0.13, 9),
                    color: "#999",
                    whiteSpace: "nowrap",
                }}
            >
                종합 집중도
            </span>
        </div>
    );
}

// ── 메인 컴포넌트 ───
export default function FocusRings({ result, currentMode }) {
    const metrics = useMemo(
        () => buildMetrics(result, currentMode),
        [result, currentMode],
    );
    const overall = useMemo(
        () => calcOverall(metrics, result),
        [metrics, result],
    );

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: "20px 24px",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* 헤더 */}
            <div
                style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: 8,
                    flexShrink: 0,
                }}
            >
                집중도 모니터링
            </div>

            {/* 3×2 그리드 */}
            <div
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridTemplateRows: "auto auto",
                    columnGap: 8,
                    rowGap: 14,
                    alignContent: "center",
                    alignItems: "center",
                    justifyItems: "center",
                }}
            >
                {metrics.map((m) => (
                    <Ring key={m.key} metric={m} />
                ))}
                <OverallRing score={overall} />
            </div>
        </div>
    );
}
