import styles from "./OptionToggles.module.css";

export default function OptionToggles({ options, onChange, currentMode }) {
    return (
        <div>
            <div
                className={styles.row}
                style={{
                    // currentMode 기반 동적 값
                    borderBottom:
                        currentMode === "휴식" ? "1px solid #f5f5f5" : "none",
                }}
            >
                <div>
                    <div className={styles.rowTitle}>2회 접속 시 허용 팝업</div>
                    <div className={styles.rowDesc}>
                        같은 금지 페이지에 2번 접속 시 "허용하시겠습니까?" 팝업
                        표시
                    </div>
                </div>
                <Toggle
                    checked={options.allowPopup}
                    onChange={(v) => onChange("allowPopup", v)}
                />
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <label className={styles.toggleLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.toggleInput}
            />
            <span
                className={styles.toggleTrack}
                style={{
                    // checked 기반 동적 값
                    background: checked ? "#2563eb" : "#ddd",
                }}
            >
                <span
                    className={styles.toggleThumb}
                    style={{
                        // checked 기반 동적 값
                        left: checked ? 21 : 3,
                    }}
                />
            </span>
        </label>
    );
}
