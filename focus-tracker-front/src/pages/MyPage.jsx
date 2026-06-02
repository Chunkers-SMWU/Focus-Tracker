import { useState, useEffect } from "react";
import { getSessionHistory } from "../api/sessionApi";
import styles from "./MyPage.module.css";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const MODE_COLOR = {
    LECTURE: "#2563eb",
    SEARCH: "#16a34a",
    LOCK: "#dc2626",
};

const MODE_BG = {
    LECTURE: "#eff6ff",
    SEARCH: "#f0fdf4",
    LOCK: "#fff1f2",
};

const MODE_LABEL = {
    LECTURE: "강의시청",
    SEARCH: "자료검색",
    LOCK: "잠금",
};

function toKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${String(s).padStart(2, "0")}초`;
}

export default function MyPage() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-indexed
    const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD"

    const [sessionData, setSessionData] = useState({});

    useEffect(() => {
        getSessionHistory()
            .then((data) => setSessionData(data))
            .catch((e) => console.error("세션 이력 조회 실패:", e));
    }, []);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrev = () => {
        if (month === 0) {
            setYear((y) => y - 1);
            setMonth(11);
        } else setMonth((m) => m - 1);
    };
    const handleNext = () => {
        if (month === 11) {
            setYear((y) => y + 1);
            setMonth(0);
        } else setMonth((m) => m + 1);
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // 먼저 진행한 세션이 아래, 가장 최근 세션이 위에 표시
    const selectedSessions = selectedDate
        ? (sessionData[selectedDate]?.slice().reverse() ?? null)
        : null;

    return (
        <div className={styles.container}>
            {/* 달력 카드 */}
            <div className={styles.calendarCard}>
                <div className={styles.nav}>
                    <button className={styles.navBtn} onClick={handlePrev}>
                        ‹
                    </button>
                    <span className={styles.navTitle}>
                        {year}년 {month + 1}월
                    </span>
                    <button className={styles.navBtn} onClick={handleNext}>
                        ›
                    </button>
                </div>

                <div className={styles.grid}>
                    {DAYS.map((d) => (
                        <div key={d} className={styles.dayHeader}>
                            {d}
                        </div>
                    ))}
                    {cells.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} />;
                        const key = toKey(year, month, day);
                        const sessions = sessionData[key];
                        const isToday =
                            day === today.getDate() &&
                            month === today.getMonth() &&
                            year === today.getFullYear();
                        return (
                            <button
                                key={key}
                                className={styles.cell}
                                style={{
                                    background: isToday
                                        ? "#eff6ff"
                                        : "transparent",
                                    fontWeight: isToday ? 700 : 400,
                                    color: isToday ? "#2563eb" : "#1a1a1a",
                                }}
                                onClick={() => setSelectedDate(key)}
                            >
                                <span className={styles.cellDay}>{day}</span>
                                <span className={styles.dotRow}>
                                    {sessions &&
                                        sessions
                                            .slice()
                                            .reverse()
                                            .map((s, idx) => (
                                                <span
                                                    key={idx}
                                                    className={styles.dot}
                                                    style={{
                                                        background:
                                                            MODE_COLOR[
                                                                s.mode
                                                            ] ?? "#2563eb",
                                                    }}
                                                />
                                            ))}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 모달 */}
            {selectedDate && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setSelectedDate(null)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.modalClose}
                            onClick={() => setSelectedDate(null)}
                        >
                            ✕
                        </button>

                        <div className={styles.modalHeader}>
                            <p className={styles.modalDate}>{selectedDate}</p>
                        </div>

                        <div className={styles.modalBody}>
                            {selectedSessions ? (
                                <div className={styles.sessionList}>
                                    {selectedSessions.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.sessionCard}
                                            style={{
                                                background:
                                                    MODE_BG[s.mode] ??
                                                    "#f9fafb",
                                                borderColor:
                                                    MODE_COLOR[s.mode] ??
                                                    "#e5e5e5",
                                            }}
                                        >
                                            <p
                                                className={styles.sessionMode}
                                                style={{
                                                    color:
                                                        MODE_COLOR[s.mode] ??
                                                        "#2563eb",
                                                }}
                                            >
                                                {MODE_LABEL[s.mode] ?? s.mode}
                                            </p>
                                            <div
                                                className={styles.sessionStats}
                                            >
                                                <div className={styles.statRow}>
                                                    <span
                                                        className={
                                                            styles.statLabel
                                                        }
                                                    >
                                                        종합 집중도
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.statValue
                                                        }
                                                    >
                                                        {s.focusScore ?? 0}%
                                                    </span>
                                                </div>
                                                <div className={styles.statRow}>
                                                    <span
                                                        className={
                                                            styles.statLabel
                                                        }
                                                    >
                                                        최대 집중 시간
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.statValue
                                                        }
                                                    >
                                                        {formatSeconds(
                                                            s.maxFocusTime ?? 0,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className={styles.statRow}>
                                                    <span
                                                        className={
                                                            styles.statLabel
                                                        }
                                                    >
                                                        세션 이용 시간
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.statValue
                                                        }
                                                    >
                                                        {formatSeconds(
                                                            s.totalSeconds,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.modalSub}>
                                    기록된 세션이 없어요.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
