import { useState, useCallback, useEffect, useRef } from "react";
import Header from "./components/layout/Header";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import ModeSelectPage from "./pages/ModeSelectPage";
import ReportPage from "./pages/ReportPage";
import { useDrowsyDetection } from "./hooks/useDrowsyDetection.js";

// 스플래시
function SplashScreen() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                animation: "splashFadeOut 0.5s ease 1.8s forwards",
            }}
        >
            <div
                style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#2563eb",
                    letterSpacing: "-0.02em",
                    animation: "splashFadeIn 0.6s ease forwards",
                }}
            >
                Focus Tracker
            </div>
            <style>{`
                @keyframes splashFadeIn {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes splashFadeOut {
                    from { opacity: 1; }
                    to   { opacity: 0; pointer-events: none; }
                }
            `}</style>
        </div>
    );
}

// App
export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    // 스플래시 → 모드선택 → 메인 → 리포트 순서로 진행
    const [page, setPage] = useState("modeSelect"); // "modeSelect" | "main" | "settings" | "report"

    // 졸음 감지 — App 레벨에서 관리해야 페이지 전환 시 상태 유지
    const drowsyVideoRef = useRef(null);
    const drowsy = useDrowsyDetection(drowsyVideoRef);

    // 설정 상태 — App이 single source of truth
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

    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 2300);
        return () => clearTimeout(t);
    }, []);

    const handleModeSelect = (mode) => {
        setCurrentMode(mode);
        setThresholds({});
    };

    // 초기 모드 선택 완료 → 메인으로 전환
    const handleInitialModeSelect = (mode) => {
        setCurrentMode(mode);
        setThresholds({});
        setPage("main");
    };

    const handleSave = () => setToastVisible(true);
    const handleToastHide = useCallback(() => setToastVisible(false), []);
    const handleSettingsOpen = () => setPage("settings");
    const handleClose = () => setPage("main");
    const handleEnd = () => setPage("report");
    const handleRestart = () => window.location.reload();

    return (
        <>
            {showSplash && <SplashScreen />}

            {/* 리포트 — 헤더 없이 단독 표시 */}
            {page === "report" && (
                <ReportPage
                    currentMode={currentMode}
                    onRestart={handleRestart}
                />
            )}

            {/* 모드 선택 — 헤더 없이 단독 표시 */}
            {!showSplash && page === "modeSelect" && (
                <ModeSelectPage onSelect={handleInitialModeSelect} />
            )}

            {/* 메인 / 설정 — 헤더 포함 */}
            {(page === "main" || page === "settings") && (
                <>
                    <Header
                        currentMode={currentMode}
                        onModeSelect={handleModeSelect}
                        onSettingsOpen={handleSettingsOpen}
                    />
                    {page === "main" && (
                        <MainPage
                            currentMode={currentMode}
                            drowsy={{ ...drowsy, videoRef: drowsyVideoRef }}
                            onEnd={handleEnd}
                        />
                    )}
                    {page === "settings" && (
                        <SettingsPage
                            currentMode={currentMode}
                            thresholds={thresholds}
                            onThresholdChange={(k, v) =>
                                setThresholds((p) => ({ ...p, [k]: v }))
                            }
                            sites={sites}
                            onSiteAdd={(s) => setSites((p) => [...p, s])}
                            onSiteRemove={(s) =>
                                setSites((p) => p.filter((x) => x !== s))
                            }
                            options={options}
                            onOptionChange={(k, v) =>
                                setOptions((p) => ({ ...p, [k]: v }))
                            }
                            restMinutes={restMinutes}
                            onRestMinutesChange={setRestMinutes}
                            toastVisible={toastVisible}
                            onToastHide={handleToastHide}
                            onSave={handleSave}
                            onClose={handleClose}
                        />
                    )}
                </>
            )}
        </>
    );
}
