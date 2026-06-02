import { modeData } from "../data/modeData";
import styles from "./TabStats.module.css";

const ITEMS = [
    { key: "tabSwitch", label: "탭 전환 횟수", unit: "회" },
    { key: "tabAway", label: "탭 이탈 누적 시간", unit: "time" },
    { key: "rapidSwitch", label: "짧은 간격 반복 전환", unit: "회" },
    { key: "blockedAccess", label: "허용되지 않은 창 접속", unit: "회" },
];

const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
};

export default function TabStats({ stats = {}, currentMode }) {
    const modeValues = modeData[currentMode]?.values ?? {};

    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>탭 활동</div>
            <div className={styles.list}>
                {ITEMS.map((item, i) => {
                    const inactive = modeValues[item.key] === null;
                    const value = stats[item.key];

                    let display;
                    if (inactive) {
                        display = "—";
                    } else if (item.unit === "time") {
                        display = formatTime(value ?? 0);
                    } else {
                        display = `${value ?? 0}${item.unit}`;
                    }

                    return (
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
                            <span className={styles.rowLabel}>
                                {item.label}
                            </span>
                            <span
                                className={styles.rowValue}
                                style={{ color: inactive ? "#ccc" : undefined }}
                            >
                                {display}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
