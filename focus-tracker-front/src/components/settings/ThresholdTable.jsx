import { modeData, fieldMap } from "../../data/modeData";

export default function ThresholdTable({ currentMode, thresholds, onChange }) {
    const { values, units } = modeData[currentMode];

    return (
        <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
            <thead>
                <tr>
                    {["항목", "기준값", "단위"].map((h) => (
                        <th
                            key={h}
                            style={{
                                textAlign: "left",
                                padding: "8px 10px",
                                color: "#888",
                                fontWeight: 500,
                                borderBottom: "1px solid #f0f0f0",
                                fontSize: 13,
                            }}
                        >
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
                            <td
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #f5f5f5",
                                }}
                            >
                                {f.label}
                            </td>
                            <td
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #f5f5f5",
                                }}
                            >
                                {val === null ? (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            padding: "3px 10px",
                                            borderRadius: 20,
                                            background: "#f0f0f0",
                                            color: "#999",
                                        }}
                                    >
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
                                        style={{
                                            width: 80,
                                            border: "1px solid #ddd",
                                            borderRadius: 8,
                                            padding: "5px 8px",
                                            fontSize: 13,
                                            background: "#fafafa",
                                            textAlign: "center",
                                        }}
                                    />
                                )}
                            </td>
                            <td
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #f5f5f5",
                                    fontSize: 12,
                                    color: "#888",
                                }}
                            >
                                {unit ?? ""}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
