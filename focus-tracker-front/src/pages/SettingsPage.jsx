import ThresholdTable from "../components/settings/ThresholdTable";
import BlockedSiteList from "../components/settings/BlockedSiteList";
import OptionToggles from "../components/settings/OptionToggles";
import Toast from "../components/Toast";
import { modeData } from "../data/modeData";

export default function SettingsPage({
    currentMode,
    thresholds,
    onThresholdChange,
    sites,
    onSiteAdd,
    onSiteRemove,
    options,
    onOptionChange,
    restMinutes,
    onRestMinutesChange,
    toastVisible,
    onToastHide,
    onSave,
    onClose,
}) {
    const badge = modeData[currentMode].label;

    return (
        <div
            style={{
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                background: "#fff",
                minHeight: "calc(100vh - 56px)",
                padding: "2rem 1rem",
                color: "#1a1a1a",
            }}
        >
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
                {/* 페이지 헤더 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "2rem",
                    }}
                >
                    <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
                        브라우저 탭 설정
                    </h1>
                    <button
                        onClick={onClose}
                        aria-label="설정 닫기"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 22,
                            color: "#999",
                            lineHeight: 1,
                            padding: "4px 8px",
                            borderRadius: 6,
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#1a1a1a")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#999")
                        }
                    >
                        ✕
                    </button>
                </div>

                <Section
                    title={
                        <>
                            경고창 팝업 기준{" "}
                            <span
                                style={{
                                    fontSize: 11,
                                    padding: "2px 9px",
                                    borderRadius: 20,
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                    marginLeft: 8,
                                    fontWeight: 500,
                                }}
                            >
                                {badge}
                            </span>
                        </>
                    }
                >
                    <ThresholdTable
                        currentMode={currentMode}
                        thresholds={thresholds}
                        onChange={onThresholdChange}
                    />
                </Section>

                <Section title="금지 페이지 설정">
                    <BlockedSiteList
                        sites={sites}
                        onAdd={onSiteAdd}
                        onRemove={onSiteRemove}
                    />
                </Section>

                <Section title="선택 기능">
                    <OptionToggles
                        options={options}
                        onChange={onOptionChange}
                        currentMode={currentMode}
                        restMinutes={restMinutes}
                        onRestMinutesChange={onRestMinutesChange}
                    />
                </Section>

                {/* 설정 저장 버튼 — 가운데 정렬 고정 너비 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "1.5rem",
                    }}
                >
                    <button
                        onClick={onSave}
                        style={{
                            padding: "9px 48px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        설정 저장
                    </button>
                </div>
            </div>

            <Toast visible={toastVisible} onHide={onToastHide} />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: "2rem" }}>
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 10,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    padding: "1.25rem",
                }}
            >
                {children}
            </div>
        </div>
    );
}
