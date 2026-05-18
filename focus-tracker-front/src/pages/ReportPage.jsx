import styles from "./ReportPage.module.css";

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
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* 상단 타이틀 */}
                <div className={styles.header}>
                    <p className={styles.brand}>Focus Tracker</p>
                    <h1 className={styles.title}>학습 리포트</h1>
                    <p className={styles.subtitle}>
                        오늘의 집중 세션이 종료되었습니다
                    </p>
                </div>

                {/* 세션 요약 */}
                <Section title="세션 요약">
                    <Row label="모드">
                        <span
                            className={styles.rowValue}
                            style={{ color: modeColors[currentMode] }}
                        >
                            {modeLabels[currentMode]}
                        </span>
                    </Row>
                    <Row label="총 학습 시간">
                        <span className={styles.rowValue}>
                            {fmt(s.totalSeconds)}
                        </span>
                    </Row>
                    <Row label="집중 시간">
                        <span className={styles.rowValueBlue}>
                            {fmt(s.focusSeconds)}
                        </span>
                    </Row>
                    <Row label="비집중 시간">
                        <span className={styles.rowValueRed}>
                            {fmt(s.nonFocusSeconds)}
                        </span>
                    </Row>
                    <Row label="집중도" last>
                        <span className={styles.rowValue}>
                            {s.totalSeconds > 0
                                ? `${Math.round((s.focusSeconds / s.totalSeconds) * 100)}%`
                                : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 지표별 상세 */}
                <Section title="지표별 상세">
                    <Row label="깜빡임">
                        <span className={styles.rowValue}>
                            {s.blinkRate != null ? `${s.blinkRate}회/분` : "—"}
                        </span>
                    </Row>
                    <Row label="눈 감김 누적 시간">
                        <span className={styles.rowValue}>
                            {fmt(s.eyeClosedSeconds)}
                        </span>
                    </Row>
                    <Row label="고개 기울기 횟수" last>
                        <span className={styles.rowValue}>
                            {s.headTiltCount != null
                                ? `${s.headTiltCount}회`
                                : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 총평 */}
                <Section title="총평">
                    <p className={styles.comment}>
                        {/* TODO: 지표 분석 후 자동 생성 필요 */}
                        총평 내용이 여기에 표시됩니다.
                    </p>
                </Section>

                {/* 처음으로 버튼 */}
                <div className={styles.btnRow}>
                    <button className={styles.restartBtn} onClick={onRestart}>
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
            <div className={styles.sectionLabel}>{title}</div>
            <div className={styles.sectionBox}>{children}</div>
        </div>
    );
}

function Row({ label, children, last }) {
    return (
        <div className={`${styles.row} ${!last ? styles.rowBorder : ""}`}>
            <span className={styles.rowLabel}>{label}</span>
            {children}
        </div>
    );
}
