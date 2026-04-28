import { useState, useCallback } from "react";
import ModeSelector from "./components/ModeSelector";
import ThresholdTable from "./components/ThresholdTable";
import BlockedSiteList from "./components/BlockedSiteList";
import OptionToggles from "./components/OptionToggles";
import Toast from "./components/Toast";
import { modeData } from "./data/modeData";

export default function App() {
    const [currentMode, setCurrentMode] = useState("강의");
    const [thresholds, setThresholds] = useState({});
    const [sites, setSites] = useState([
        "youtube.com",
        "instagram.com",
        "twitter.com",
    ]);
    const [options, setOptions] = useState({
        allowPopup: false,
        iframeBlock: true,
    });
    const [restMinutes, setRestMinutes] = useState(10);
    const [toastVisible, setToastVisible] = useState(false);

    const handleModeSelect = (mode) => {
        setCurrentMode(mode);
        setThresholds({}); // 모드 변경 시 임계값 초기화
    };

    const handleThresholdChange = (key, val) =>
        setThresholds((prev) => ({ ...prev, [key]: val }));

    const handleOptionChange = (key, val) =>
        setOptions((prev) => ({ ...prev, [key]: val }));

    const handleSave = () => {
        // TODO: fetch('/api/settings', { method: 'POST', body: JSON.stringify({...}) })
        setToastVisible(true);
    };

    const badge = modeData[currentMode].label;

    return (
        <div
            style={{
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                background: "#f5f5f3",
                minHeight: "100vh",
                padding: "2rem 1rem",
                color: "#1a1a1a",
            }}
        >
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 600,
                        marginBottom: "2rem",
                    }}
                >
                    브라우저 탭 설정
                </div>

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
                        모드 선택
                    </div>
                    <ModeSelector
                        currentMode={currentMode}
                        onSelect={handleModeSelect}
                    />
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
                        onChange={handleThresholdChange}
                    />
                </Section>

                <Section title="금지 페이지 설정">
                    <BlockedSiteList
                        sites={sites}
                        onAdd={(s) => setSites((prev) => [...prev, s])}
                        onRemove={(s) =>
                            setSites((prev) => prev.filter((x) => x !== s))
                        }
                    />
                </Section>

                <Section title="선택 기능">
                    <OptionToggles
                        options={options}
                        onChange={handleOptionChange}
                        currentMode={currentMode}
                        restMinutes={restMinutes}
                        onRestMinutesChange={setRestMinutes}
                    />
                </Section>

                <button
                    onClick={handleSave}
                    style={{
                        width: "100%",
                        padding: 12,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        marginTop: "1.5rem",
                    }}
                >
                    설정 저장
                </button>
            </div>

            <Toast
                visible={toastVisible}
                onHide={useCallback(() => setToastVisible(false), [])}
            />
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
