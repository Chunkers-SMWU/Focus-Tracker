import { useState, useCallback, useEffect, useRef } from "react";
import Header from "./components/layout/Header";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import ModeSelectPage from "./pages/ModeSelectPage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useDrowsyDetection } from "./hooks/useDrowsyDetection.js";
import { useTabTracking } from "./hooks/useTabTracking.js";

const DEFAULT_SITES = ["youtube.com", "instagram.com", "twitter.com"];
const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

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
    const [page, setPage] = useState("login");

    const drowsyVideoRef = useRef(null);
    const drowsy = useDrowsyDetection(drowsyVideoRef);

    // 탭 추적 — App 레벨에서 관리해야 페이지 이동 시 초기화 안 됨
    const { tabStats, reset: resetTabs } = useTabTracking(drowsy.running);

    const [sessionSnapshot, setSessionSnapshot] = useState(null);

    const [currentMode, setCurrentMode] = useState("강의");
    const [thresholds, setThresholds] = useState({});

    // 차단 목록 — content.js 통해 chrome.storage 연동
    const [sites, setSites] = useState(DEFAULT_SITES);
    useEffect(() => {
        // content.js에 로드 요청
        window.postMessage({ type: "LOAD_SITES" }, FOCUS_TRACKER_ORIGIN);

        // content.js로부터 응답 수신
        const handleMessage = (e) => {
            if (e.origin !== FOCUS_TRACKER_ORIGIN) return;
            if (e.data?.type !== "SITES_LOADED") return;
            if (e.data.sites) setSites(e.data.sites); // 저장된 값 있을 때만 덮어쓰기
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

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
    const handleInitialModeSelect = (mode) => {
        setCurrentMode(mode);
        setThresholds({});
        setPage("main");
    };

    // content.js에 저장 요청
    const handleSave = () => {
        window.postMessage({ type: "SAVE_SITES", sites }, FOCUS_TRACKER_ORIGIN);
        setToastVisible(true);
    };

    const handleToastHide = useCallback(() => setToastVisible(false), []);
    const handleSettingsOpen = () => setPage("settings");
    const handleClose = () => setPage("main");
    const handleRestart = () => window.location.reload();

    // 세션 종료 시 result 스냅샷 저장 + 웹캠 중지
    const handleEnd = () => {
        drowsy.stop();
        setSessionSnapshot({ ...drowsy.result });
        setPage("report");
    };

    // 로그인 / 회원가입 / 로그아웃 핸들러
    const handleLogin = () => setPage("modeSelect"); // TODO: 유저 정보 저장
    const handleGuest = () => setPage("modeSelect");
    const handleSignupPage = () => setPage("signup");
    const handleSignupComplete = () => setPage("login");
    const handleLogout = () => setPage("login");

    // 세션 초기화
    const handleReset = () => {
        drowsy.reset();
        resetTabs();
    };

    return (
        <>
            {showSplash && <SplashScreen />}

            {/* 로그인 */}
            {!showSplash && page === "login" && (
                <LoginPage
                    onLogin={handleLogin}
                    onGuest={handleGuest}
                    onSignup={handleSignupPage}
                />
            )}

            {/* 회원가입 */}
            {!showSplash && page === "signup" && (
                <SignupPage
                    onSignupComplete={handleSignupComplete}
                    onBack={() => setPage("login")}
                />
            )}

            {/* 모드 선택 */}
            {!showSplash && page === "modeSelect" && (
                <ModeSelectPage onSelect={handleInitialModeSelect} />
            )}

            {/* 리포트 */}
            {page === "report" && (
                <ReportPage
                    currentMode={currentMode}
                    snapshot={sessionSnapshot}
                    onRestart={handleRestart}
                />
            )}

            {/* 메인 / 설정 */}
            {(page === "main" || page === "settings") && (
                <>
                    <Header
                        currentMode={currentMode}
                        onModeSelect={handleModeSelect}
                        onSettingsOpen={handleSettingsOpen}
                        onLogout={handleLogout}
                    />
                    {page === "main" && (
                        <MainPage
                            currentMode={currentMode}
                            drowsy={{ ...drowsy, videoRef: drowsyVideoRef }}
                            tabStats={tabStats}
                            onEnd={handleEnd}
                            onReset={handleReset}
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
