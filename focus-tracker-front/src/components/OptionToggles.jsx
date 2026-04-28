export default function OptionToggles({
    options,
    onChange,
    currentMode,
    restMinutes,
    onRestMinutesChange,
}) {
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid #f5f5f5",
                }}
            >
                <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                        2회 접속 시 허용 팝업
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
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
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom:
                        currentMode === "휴식" ? "1px solid #f5f5f5" : "none",
                }}
            >
                <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                        iframe 내 외부 링크 차단
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                        설정된 공부 사이트 안에서 외부 링크 접속 시 페이지 Block
                    </div>
                </div>
                <Toggle
                    checked={options.iframeBlock}
                    onChange={(v) => onChange("iframeBlock", v)}
                />
            </div>

            {currentMode === "휴식" && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 0",
                    }}
                >
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                            휴식 시간 제한
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#888",
                                marginTop: 3,
                            }}
                        >
                            타이머 종료 시 집중 모드 복귀 알림
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <input
                            type="number"
                            min={1}
                            max={60}
                            value={restMinutes}
                            onChange={(e) =>
                                onRestMinutesChange(e.target.value)
                            }
                            style={{
                                width: 60,
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: "5px 8px",
                                fontSize: 13,
                                background: "#fafafa",
                                textAlign: "center",
                            }}
                        />
                        <span style={{ fontSize: 13, color: "#888" }}>분</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <label
            style={{
                position: "relative",
                width: 40,
                height: 22,
                flexShrink: 0,
                cursor: "pointer",
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    background: checked ? "#2563eb" : "#ddd",
                    borderRadius: 11,
                    transition: "background 0.2s",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        width: 16,
                        height: 16,
                        left: checked ? 21 : 3,
                        top: 3,
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.2s",
                    }}
                />
            </span>
        </label>
    );
}
