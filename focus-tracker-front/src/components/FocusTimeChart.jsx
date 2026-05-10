const SIZE = 160;
const STROKE = 13;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

const START_DEG = 225;
const TOTAL_DEG = 270;
const END_DEG = START_DEG + TOTAL_DEG;
const CHART_HEIGHT = 160;

const PCT_TOP = `${(CY / CHART_HEIGHT) * 100}%`;

function polarToXY(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
    const s = polarToXY(cx, cy, r, startDeg);
    const e = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const TRACK_PATH = arcPath(CX, CY, R, START_DEG, END_DEG);

function fmt(sec) {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

export default function FocusTimeChart({
    totalSeconds = 0,
    focusSeconds = 0,
    nonFocusSeconds = 0,
}) {
    const totalSec = Math.floor(totalSeconds);
    const focusSec = Math.floor(focusSeconds);
    const nonFocusSec = Math.floor(nonFocusSeconds);

    const ratio = totalSec > 0 ? Math.min(focusSec / totalSec, 1) : 0;
    const pct = Math.round(ratio * 100);
    const fillDeg = ratio * TOTAL_DEG;

    const fillPath =
        fillDeg >= TOTAL_DEG
            ? TRACK_PATH
            : fillDeg > 0
              ? arcPath(CX, CY, R, START_DEG, START_DEG + fillDeg)
              : null;

    const hasData = totalSec > 0;

    return (
        <div
            style={{
                padding: "14px 20px",
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
            }}
        >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                집중 시간
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <Legend color="#2563eb" label="집중" />
                <Legend color="#e5e5e5" label="비집중" />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                    style={{
                        position: "relative",
                        width: SIZE,
                        height: CHART_HEIGHT,
                    }}
                >
                    <svg
                        width={SIZE}
                        height={CHART_HEIGHT}
                        viewBox={`0 0 ${SIZE} ${CHART_HEIGHT}`}
                        style={{ overflow: "visible" }}
                    >
                        <path
                            d={TRACK_PATH}
                            fill="none"
                            stroke="#e5e5e5"
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                        />
                        {fillPath && (
                            <path
                                d={fillPath}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth={STROKE}
                                strokeLinecap="round"
                            />
                        )}
                    </svg>
                    <div
                        style={{
                            position: "absolute",
                            top: PCT_TOP,
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: 22,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {hasData ? `${pct}%` : "—"}
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                    padding: "6px 0 0",
                    borderTop: "1px solid #f5f5f5",
                }}
            >
                <TimeBox
                    label="집중"
                    value={hasData ? fmt(focusSec) : "--:--"}
                    color="#2563eb"
                />
                <TimeBox
                    label="전체"
                    value={hasData ? fmt(totalSec) : "--:--"}
                    color="#888"
                />
                <TimeBox
                    label="비집중"
                    value={hasData ? fmt(nonFocusSec) : "--:--"}
                    color="#dc2626"
                />
            </div>
        </div>
    );
}

function Legend({ color, label }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "#888",
            }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                }}
            />
            {label}
        </div>
    );
}

function TimeBox({ label, value, color }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
            }}
        >
            <span style={{ fontSize: 10, color: "#aaa" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>
                {value}
            </span>
        </div>
    );
}
