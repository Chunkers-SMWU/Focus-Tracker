import { useState } from "react";
import styles from "./ReportPage.module.css";

const modeLabels = {
    강의: "강의시청",
    자료: "자료검색",
    잠금: "잠금",
};
const modeColors = {
    강의: "#2563eb",
    자료: "#16a34a",
    잠금: "#dc2626",
};

// 위험도 상태별 색상
const STATUS_COLORS = {
    정상: "#22c55e",
    주의: "#f97316",
    경고: "#ef4444",
    위험: "#dc2626",
};

// 종합 집중도 링 — integratedScore.score(0~100점) 기반
// 점수가 높을수록 위험이므로 집중도는 반전: 집중도 = 100 - score
function OverallRing({ integratedScore }) {
    const rawScore = integratedScore?.score ?? null;
    const focusScore = rawScore !== null ? Math.round(100 - rawScore) : null;
    const status = integratedScore?.status ?? null;

    const size = 200;
    const r = 76;
    const sw = 12;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset =
        circumference * (1 - (focusScore !== null ? focusScore / 100 : 0));

    const color =
        focusScore === null
            ? "#d1d5db"
            : focusScore >= 70
              ? "#22c55e"
              : focusScore >= 50
                ? "#f97316"
                : "#ef4444";

    return (
        <div className={styles.overallRing}>
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
                <div className={styles.overallRingInner}>
                    <span className={styles.overallScore} style={{ color }}>
                        {focusScore !== null ? `${focusScore}` : "—"}
                    </span>
                    {focusScore !== null && (
                        <span className={styles.overallScoreUnit}>/100</span>
                    )}
                </div>
            </div>
            {/* 위험도 상태 배지 */}
            {status && (
                <span
                    className={styles.overallStatus}
                    style={{ color: STATUS_COLORS[status] ?? "#888" }}
                >
                    {status}
                </span>
            )}
            <span className={styles.overallLabel}>종합 집중도</span>
        </div>
    );
}

const STEP_LABELS = { 1: "1단계", 2: "2단계", 3: "3단계" };
const STEP_COLORS = { 1: "#f97316", 2: "#ef4444", 3: "#dc2626" };

// 경고 기록 섹션
function AlertLogSection({ alertLog }) {
    const [expanded, setExpanded] = useState(false);
    const count = alertLog?.length ?? 0;

    return (
        <Section title="경고 기록">
            <Row label="총 경고 횟수">
                <span
                    className={styles.rowValue}
                    style={{ color: count > 0 ? "#ef4444" : "#1a1a1a" }}
                >
                    {count}회
                </span>
            </Row>
            {count > 0 && (
                <div className={styles.alertLogToggleRow}>
                    <button
                        className={styles.alertLogToggleBtn}
                        onClick={() => setExpanded((p) => !p)}
                    >
                        경고 항목 보기 {expanded ? "▲" : "▼"}
                    </button>
                </div>
            )}
            {expanded && (
                <div className={styles.alertLogList}>
                    {alertLog.map((log, i) => (
                        <div key={i} className={styles.alertLogItem}>
                            <div className={styles.alertLogItemHeader}>
                                <span
                                    className={styles.alertLogStep}
                                    style={{ color: STEP_COLORS[log.step] }}
                                >
                                    {STEP_LABELS[log.step]} 경고
                                </span>
                                <span className={styles.alertLogTime}>
                                    {new Date(log.timestamp).toLocaleTimeString(
                                        "ko-KR",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        },
                                    )}
                                </span>
                            </div>
                            <div className={styles.alertLogTags}>
                                {log.triggeredItems.map((item) => (
                                    <span
                                        key={item}
                                        className={styles.alertLogTag}
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Section>
    );
}

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

export default function ReportPage({
    currentMode,
    snapshot,
    onModeChange,
    onExit,
}) {
    const s = snapshot ?? {};
    const integratedScore = s.integratedScore ?? null;
    const focusScore =
        integratedScore?.score != null
            ? Math.round(100 - integratedScore.score)
            : null;

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* 상단 타이틀 */}
                <div className={styles.header}>
                    <p className={styles.brand}>Focus Tracker</p>
                    <h1 className={styles.title}>학습 리포트</h1>
                </div>

                {/* 종합 집중도 */}
                <div className={styles.overallRow}>
                    <OverallRing integratedScore={integratedScore} />
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
                            {focusScore !== null ? `${focusScore}점` : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 경고 기록 */}
                <AlertLogSection alertLog={s.alertLog} />

                {/* 버튼 행 */}
                <div className={styles.btnRow}>
                    <button className={styles.modeBtn} onClick={onModeChange}>
                        모드 변경
                    </button>
                    <button className={styles.logoutBtn} onClick={onExit}>
                        종료하기
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
