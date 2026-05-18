import { modeData, fieldMap } from "../../data/modeData";
import styles from "./ThresholdTable.module.css";

export default function ThresholdTable({ currentMode, thresholds, onChange }) {
    const { values, units } = modeData[currentMode];

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    {["항목", "기준값", "단위"].map((h) => (
                        <th key={h} className={styles.th}>
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {fieldMap.map((f) => {
                    const val = values[f.key];
                    const unit = units[f.key];
                    return (
                        <tr key={f.key}>
                            <td className={styles.td}>{f.label}</td>
                            <td className={styles.td}>
                                {val === null ? (
                                    <span className={styles.badge}>
                                        해당 없음
                                    </span>
                                ) : (
                                    <input
                                        type="number"
                                        min={1}
                                        value={thresholds[f.key] ?? val}
                                        onChange={(e) =>
                                            onChange(f.key, e.target.value)
                                        }
                                        className={styles.input}
                                    />
                                )}
                            </td>
                            <td className={styles.tdUnit}>{unit ?? ""}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
