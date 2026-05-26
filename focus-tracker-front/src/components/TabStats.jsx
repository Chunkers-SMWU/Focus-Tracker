import styles from "./TabStats.module.css";

const ITEMS = [
    { key: "tabSwitch", label: "탭 전환 횟수", unit: "회" },
    { key: "tabAway", label: "탭 이탈 누적 시간", unit: "초" },
    { key: "rapidSwitch", label: "짧은 간격 반복 전환", unit: "회" },
    { key: "blockedAccess", label: "허용되지 않은 창 접속", unit: "회" },
];

export default function TabStats({ stats = {} }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>탭 활동</div>
            <div className={styles.list}>
                {ITEMS.map((item, i) => (
                    <div
                        key={item.key}
                        className={styles.row}
                        style={{
                            // i 기반 동적 값
                            borderBottom:
                                i < ITEMS.length - 1
                                    ? "1px solid #f5f5f5"
                                    : "none",
                        }}
                    >
                        <span className={styles.rowLabel}>{item.label}</span>
                        <span className={styles.rowValue}>
                            {stats[item.key] != null
                                ? `${stats[item.key]}${item.unit}`
                                : "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
