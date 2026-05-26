import styles from "./OptionToggles.module.css";

export default function OptionToggles({
    options,
    onChange,
    currentMode,
    restMinutes,
    onRestMinutesChange,
}) {
    return (
        <div>
            <div className={`${styles.row} ${styles.rowBorder}`}>
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

            <div
                className={styles.row}
                style={{
                    // currentMode 기반 동적 값
                    borderBottom:
                        currentMode === "휴식" ? "1px solid #f5f5f5" : "none",
                }}
            >
                <div>
                    <div className={styles.rowTitle}>
                        iframe 내 외부 링크 차단
                    </div>
                    <div className={styles.rowDesc}>
                        설정된 공부 사이트 안에서 외부 링크 접속 시 페이지 Block
                    </div>
                </div>
                <Toggle
                    checked={options.iframeBlock}
                    onChange={(v) => onChange("iframeBlock", v)}
                />
            </div>

            {currentMode === "휴식" && (
                <div className={styles.row}>
                    <div>
                        <div className={styles.rowTitle}>휴식 시간 제한</div>
                        <div className={styles.rowDesc}>
                            타이머 종료 시 집중 모드 복귀 알림
                        </div>
                    </div>
                    <div className={styles.restInputRow}>
                        <input
                            type="number"
                            min={1}
                            max={60}
                            value={restMinutes}
                            onChange={(e) =>
                                onRestMinutesChange(e.target.value)
                            }
                            className={styles.restInput}
                        />
                        <span className={styles.restUnit}>분</span>
                    </div>
                </div>
            )}
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
