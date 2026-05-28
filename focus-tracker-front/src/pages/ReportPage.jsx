import { useState } from "react";
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

const MODE_CONFIG = {
    강의: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
    자료: { noFace: false, headTurn: true, eyeClosed: true, blink: true },
    잠금: { noFace: true, headTurn: true, eyeClosed: true, blink: true },
};

function buildMetrics(s, currentMode) {
    const cfg = MODE_CONFIG[currentMode] ?? MODE_CONFIG["강의"];
    return [
        {
            key: "noFace",
            value: s?.noFaceSeconds ?? null,
            active: cfg.noFace,
            thresholds: { warn: 10, danger: 20 },
            inverse: true,
        },
        {
            key: "headTurn",
            value: s?.headTurnCount ?? null,
            active: cfg.headTurn,
            thresholds: { warn: 2, danger: 3 },
            inverse: true,
        },
        {
            key: "eyeClosed",
            value: s?.eyeClosedSeconds ?? null,
            active: cfg.eyeClosed,
            thresholds: { warn: 3, danger: 10 },
            inverse: true,
        },
        {
            key: "blink",
            value: s?.blinkRate ?? 0,
            active: cfg.blink,
            thresholds: { warn: 10, danger: 8 },
            inverse: false,
            lowIsBad: true,
        },
    ];
}

function getColor(metric) {
    if (!metric.active) return "#e5e5e5";
    const v = metric.value;
    if (v === null) return "#d1d5db";
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
    if (isDanger) return "#ef4444";
    if (isWarn) return "#f97316";
    return "#22c55e";
}

function calcOverall(metrics, result) {
    const active = metrics.filter((m) => m.active && m.value !== null);
    const scores = active.map((m) => {
        const c = getColor(m);
        if (c === "#ef4444") return 0;
        if (c === "#f97316") return 50;
        return 100;
    });
    const base =
        scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 100;
    const penalties =
        (result?.eyesClosed ? 20 : 0) +
        (result?.mouthOpen ? 5 : 0) +
        (result?.alert ? 10 : 0) +
        (result?.headTilted ? 5 : 0) +
        (result?.blinkState === "DROWSY" ? 20 : 0) +
        (result?.blinkState === "LOW_FOCUS" ? 10 : 0);
    return Math.max(0, base - penalties);
}

// 종합 집중도 링
function OverallRing({ score }) {
    const size = 200;
    const r = 76;
    const sw = 12;
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
                        {score !== null ? `${score}` : "—"}
                    </span>
                    {score !== null && (
                        <span className={styles.overallScoreUnit}>/100</span>
                    )}
                </div>
            </div>
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
    const metrics = buildMetrics(s, currentMode);
    const overall = calcOverall(metrics, s);

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

                {/* 종합 집중도 */}
                <div className={styles.overallRow}>
                    <OverallRing score={overall} />
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
                            {overall !== null ? `${overall}점` : "—"}
                        </span>
                    </Row>
                </Section>

                {/* 경고 기록 */}
                <AlertLogSection alertLog={s.alertLog} />

                {/* 총평 */}
                <Section title="총평">
                    <p className={styles.comment}>
                        {/* TODO: 지표 분석 후 자동 생성 필요 */}
                        총평 내용이 여기에 표시됩니다.
                    </p>
                </Section>

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
