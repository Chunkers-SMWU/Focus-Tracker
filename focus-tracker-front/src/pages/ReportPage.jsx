const modeLabels = {
    강의: "강의시청",
    자료: "자료검색",
    잠금: "잠금",
    휴식: "휴식",
};
const modeColors = {
    강의: "#2563eb",
    자료: "#16a34a",
    잠금: "#dc2626",
    휴식: "#9333ea",
};

function fmt(sec) {
    if (!sec) return "—";
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

export default function ReportPage({ currentMode, snapshot, onRestart }) {
    const s = snapshot ?? {};

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem 1rem",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 580,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                }}
            >
                {/* 상단 타이틀 */}
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                    <p
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#2563eb",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                        }}
                    >
                        Focus Tracker
                    </p>
                    <h1
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#1a1a1a",
                            letterSpacing: "-0.02em",
                            marginBottom: 4,
                        }}
                    >
                        학습 리포트
                    </h1>
                    <p style={{ fontSize: 13, color: "#888" }}>
                        오늘의 집중 세션이 종료되었습니다
                    </p>
                </div>

                {/* 세션 요약 */}
                <Section title="세션 요약">
                    <Row label="모드">
                        <span
                            style={{
                                fontWeight: 600,
                                color: modeColors[currentMode],
                            }}
                        >
                            {modeLabels[currentMode]}
                        </span>
                    </Row>
                    <Row label="총 학습 시간">
                        <span style={{ fontWeight: 600 }}>
                            {fmt(s.totalSeconds)}
                        </span>
                    </Row>
                    <Row label="집중 시간">
                        <span style={{ fontWeight: 600, color: "#2563eb" }}>
                            {fmt(s.focusSeconds)}
                        </span>
                    </Row>
                    <Row label="비집중 시간">
                        <span style={{ fontWeight: 600, color: "#dc2626" }}>
                            {fmt(s.nonFocusSeconds)}
                        </span>
                    </Row>
                    <Row label="집중도" last>
                        <span style={{ fontWeight: 600 }}>
                            {s.totalSeconds > 0
                                ? `${Math.round((s.focusSeconds / s.totalSeconds) * 100)}%`
                                : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 지표별 상세 */}
                <Section title="지표별 상세">
                    <Row label="깜빡임">
                        <span style={{ fontWeight: 600 }}>
                            {s.blinkRate != null ? `${s.blinkRate}회/분` : "—"}
                        </span>
                    </Row>
                    <Row label="눈 감김 누적 시간">
                        <span style={{ fontWeight: 600 }}>
                            {fmt(s.eyeClosedSeconds)}
                        </span>
                    </Row>
                    <Row label="고개 기울기 횟수" last>
                        <span style={{ fontWeight: 600 }}>
                            {s.headTiltCount != null
                                ? `${s.headTiltCount}회`
                                : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 총평 */}
                <Section title="총평">
                    <p
                        style={{
                            fontSize: 13,
                            color: "#888",
                            lineHeight: 1.8,
                            margin: 0,
                            textAlign: "center",
                            padding: "6px 0",
                        }}
                    >
                        {/* TODO: 지표 분석 후 자동 생성 필요 */}
                        총평 내용이 여기에 표시됩니다.
                    </p>
                </Section>

                {/* 처음으로 버튼 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 16,
                    }}
                >
                    <button
                        onClick={onRestart}
                        style={{
                            padding: "9px 48px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        처음으로
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    padding: "0 1.25rem",
                }}
            >
                {children}
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
                padding: "7px 0",
                borderBottom: last ? "none" : "1px solid #f5f5f5",
                fontSize: 13,
            }}
        >
            <span style={{ color: "#888" }}>{label}</span>
            {children}
        </div>
    );
}
