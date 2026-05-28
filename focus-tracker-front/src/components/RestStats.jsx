import styles from "./RestStats.module.css";

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
}

const ITEMS = [
    { key: "restCount", label: "휴식 횟수", format: (v) => `${v}회` },
    { key: "restSeconds", label: "총 휴식 시간", format: (v) => formatTime(v) },
];

export default function RestStats({ restCount = 0, restSeconds = 0 }) {
    const stats = { restCount, restSeconds };

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>휴식</div>
            <div className={styles.list}>
                {ITEMS.map((item, i) => (
                    <div
                        key={item.key}
                        className={styles.row}
                        style={{
                            borderBottom:
                                i < ITEMS.length - 1
                                    ? "1px solid #f5f5f5"
                                    : "none",
                        }}
                    >
                        <span className={styles.rowLabel}>{item.label}</span>
                        <span className={styles.rowValue}>
                            {item.format(stats[item.key])}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
