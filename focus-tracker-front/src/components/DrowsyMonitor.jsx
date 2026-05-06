const BLINK_STATE_META = {
    MEASURING: { label: "측정 중…", color: "#888" },
    NORMAL: { label: "정상", color: "#16a34a" },
    LOW_FOCUS: { label: "집중력 저하", color: "#d97706" },
    DROWSY: { label: "졸음 감지", color: "#dc2626" },
};

export default function DrowsyMonitor({
    result,
    error,
    running,
    onStart,
    onStop,
    videoRef,
}) {
    const blinkMeta =
        BLINK_STATE_META[result.blinkState] ?? BLINK_STATE_META.MEASURING;
    const alert = result.alert;

    return (
        <div
            style={{
                padding: "24px 28px",
                background: alert ? "#fef2f2" : "#fff",
                border: `1px solid ${alert ? "#fca5a5" : "#e5e5e5"}`,
                borderRadius: 12,
                transition: "background 0.3s ease, border-color 0.3s ease",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
        >
            {/* 헤더 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                        졸음 감지
                    </span>
                    {alert && (
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#dc2626",
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                borderRadius: 20,
                                padding: "2px 10px",
                                animation: "alertPulse 0.8s infinite",
                            }}
                        >
                            ⚠️ 경고
                        </span>
                    )}
                </div>
                <button
                    onClick={running ? onStop : onStart}
                    style={{
                        padding: "6px 18px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        background: running ? "#f3f4f6" : "#2563eb",
                        color: running ? "#555" : "#fff",
                    }}
                >
                    {running ? "중지" : "시작"}
                </button>
            </div>

            <style>{`
                @keyframes alertPulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.5; }
                }
            `}</style>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
            />

            {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <Row label="졸음">
                    <Badge on={result.eyesClosed} />
                </Row>
                <Row label="하품">
                    <Badge on={result.mouthOpen} />
                </Row>
                <Row label="자세">
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                        <Badge on={result.headTiltCount >= 1} />
                        <span
                            style={{
                                marginLeft: 8,
                                color: "#888",
                                fontSize: 12,
                            }}
                        >
                            ({result.headTiltCount}회)
                        </span>
                    </span>
                </Row>
                <Row label="깜빡임">
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                        {result.blinkRate}회/분{" "}
                        <span style={{ color: blinkMeta.color, marginLeft: 4 }}>
                            ({blinkMeta.label})
                        </span>
                    </span>
                </Row>
                <Row label="EAR" last>
                    <span
                        style={{ fontSize: 14, fontWeight: 600, color: "#555" }}
                    >
                        {result.ear ?? "—"}
                    </span>
                </Row>
            </div>
        </div>
    );
}

function Row({ label, children, last }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: last ? "none" : "1px solid #f5f5f5",
                fontSize: 14,
            }}
        >
            <span style={{ color: "#888" }}>{label}</span>
            {children}
        </div>
    );
}

function Badge({ on }) {
    return (
        <span style={{ fontWeight: 700, color: on ? "#dc2626" : "#16a34a" }}>
            {on ? "O" : "X"}
        </span>
    );
}
