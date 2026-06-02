import styles from "./FocusTimeChart.module.css";

function fmt(sec) {
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

const ITEMS = [
    { key: "focusSec", label: "집중", color: "#2563eb" },
    { key: "nonFocusSec", label: "비집중", color: "#dc2626" },
    { key: "totalSec", label: "전체", color: "#888" },
];

export default function FocusTimeChart({
    totalSeconds = 0,
    focusSeconds = 0,
    nonFocusSeconds = 0,
}) {
    const totalSec = Math.floor(totalSeconds);
    const focusSec = Math.floor(focusSeconds);
    const nonFocusSec = Math.floor(nonFocusSeconds);
    const hasData = totalSec > 0;

    const values = {
        focusSec: hasData ? fmt(focusSec) : "--:--",
        totalSec: hasData ? fmt(totalSec) : "--:--",
        nonFocusSec: hasData ? fmt(nonFocusSec) : "--:--",
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>집중 시간</div>
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
                        <span
                            className={styles.rowValue}
                            style={{ color: item.color }}
                        >
                            {values[item.key]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
