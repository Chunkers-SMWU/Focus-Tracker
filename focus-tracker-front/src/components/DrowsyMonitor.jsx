import styles from "./DrowsyMonitor.module.css";

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
            className={styles.card}
            style={{
                // alert 기반 동적 값
                background: alert ? "#fef2f2" : "#fff",
                border: `1px solid ${alert ? "#fca5a5" : "#e5e5e5"}`,
            }}
        >
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                    <span className={styles.titleText}>졸음 감지</span>
                    {alert && (
                        <span className={styles.alertBadge}>⚠️ 경고</span>
                    )}
                </div>
                <button
                    className={styles.toggleBtn}
                    onClick={running ? onStop : onStart}
                    style={{
                        // running 기반 동적 값
                        background: running ? "#f3f4f6" : "#2563eb",
                        color: running ? "#555" : "#fff",
                    }}
                >
                    {running ? "중지" : "시작"}
                </button>
            </div>

            <style>{`@keyframes alertPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
            />
            {error && <p className={styles.error}>{error}</p>}

            <div style={{ display: "flex", flexDirection: "column" }}>
                <Row label="졸음">
                    <Badge on={result.eyesClosed} />
                </Row>
                <Row label="하품">
                    <Badge on={result.mouthOpen} />
                </Row>
                <Row label="자세">
                    <span className={styles.rowValue}>
                        <Badge on={result.headTilted} />
                        <span className={styles.tiltCount}>
                            ({result.headTiltCount}회)
                        </span>
                    </span>
                </Row>
                <Row label="깜빡임" last>
                    <span className={styles.rowValue}>
                        {result.blinkRate}회/분{" "}
                        {/* blinkMeta.color 기반 동적 값 */}
                        <span style={{ color: blinkMeta.color, marginLeft: 4 }}>
                            ({blinkMeta.label})
                        </span>
                    </span>
                </Row>
            </div>
        </div>
    );
}

function Row({ label, children, last }) {
    return (
        <div
            className={styles.row}
            style={{
                // last 기반 동적 값
                borderBottom: last ? "none" : "1px solid #f5f5f5",
            }}
        >
            <span className={styles.rowLabel}>{label}</span>
            {children}
        </div>
    );
}

function Badge({ on }) {
    return (
        // on 기반 동적 값
        <span style={{ fontWeight: 700, color: on ? "#dc2626" : "#16a34a" }}>
            {on ? "O" : "X"}
        </span>
    );
}
