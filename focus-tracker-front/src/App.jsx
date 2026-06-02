import { useState, useCallback, useEffect, useRef } from "react";
import Header from "./components/layout/Header";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import ModeSelectPage from "./pages/ModeSelectPage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import SessionSelectPage from "./pages/SessionSelectPage";
import UnblockModal from "./components/UnblockModal.jsx";
import { useDrowsyDetection } from "./hooks/useDrowsyDetection.js";
import { useTabTracking } from "./hooks/useTabTracking.js";
import useDrowsyAlert from "./hooks/useDrowsyAlert.js";
import { logout } from "./api/authApi.js";
import { saveSession } from "./api/sessionApi.js";
import logo from "./assets/logo.png";

const DEFAULT_SITES = ["youtube.com", "instagram.com", "twitter.com"];
const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체
const MODE_MAP = {
    강의: "LECTURE",
    자료: "SEARCH",
    잠금: "LOCK",
};

// 스플래시
function SplashScreen({ logo }) {
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
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    animation: "splashFadeIn 0.6s ease forwards",
                }}
            >
                <img
                    src={logo}
                    alt="logo"
                    style={{
                        width: 144,
                        height: 144,
                        objectFit: "contain",
                        marginLeft: -32,
                        marginRight: -36,
                    }}
                />
                <span
                    style={{
                        fontSize: 44,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Focus Tracker
                </span>
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

    // 유저 정보 — 로그인 시 저장, 로그아웃 시 초기화
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(null); // { id, name }

    const drowsyVideoRef = useRef(null);
    const drowsy = useDrowsyDetection(drowsyVideoRef);

    // 탭 추적 — App 레벨에서 관리해야 페이지 이동 시 초기화 안 됨
    const {
        tabStats,
        alertStats,
        reset: resetTabs,
        resetAlertStats,
    } = useTabTracking(drowsy.running);

    const [sessionSnapshot, setSessionSnapshot] = useState(null);

    const [currentMode, setCurrentMode] = useState("강의");
    const [thresholds, setThresholds] = useState({});

    const { setMode } = drowsy;

    // currentMode가 바뀔 때 훅에 동기화 (noFace 활성화 여부 판단용)
    useEffect(() => {
        setMode(currentMode);
    }, [currentMode, setMode]);

    // 최초 시작 여부 — true가 되면 세션 종료/초기화 전까지 모드 변경 불가
    const [hasStarted, setHasStarted] = useState(false);

    // 세션 시작 시각 기록
    const sessionStartTimeRef = useRef(null);

    // 휴식 트래킹
    const [restCount, setRestCount] = useState(0);
    const [restSeconds, setRestSeconds] = useState(0);
    const restTimerRef = useRef(null);

    useEffect(() => {
        if (!hasStarted) return;
        if (!drowsy.running) {
            restTimerRef.current = setInterval(() => {
                setRestSeconds((p) => p + 1);
            }, 1000);
        } else {
            clearInterval(restTimerRef.current);
        }
        return () => clearInterval(restTimerRef.current);
    }, [drowsy.running, hasStarted]);

    // 휴식 타이머
    const [restTimerMinutes, setRestTimerMinutes] = useState(0);
    const [restTimeLeft, setRestTimeLeft] = useState(null);
    const [showRestDonePopup, setShowRestDonePopup] = useState(false);
    const restCountdownRef = useRef(null);

    const startRestCountdown = useCallback((minutes) => {
        clearInterval(restCountdownRef.current);
        setRestTimeLeft(minutes * 60);
        restCountdownRef.current = setInterval(() => {
            setRestTimeLeft((p) => {
                if (p === null || p <= 1) {
                    clearInterval(restCountdownRef.current);
                    setShowRestDonePopup(true);
                    return null;
                }
                return p - 1;
            });
        }, 1000);
    }, []);

    const clearRestTimer = useCallback(() => {
        clearInterval(restCountdownRef.current);
        setRestTimeLeft(null);
        setRestTimerMinutes(0);
        setShowRestDonePopup(false);
    }, []);

    // 졸음 경고 — handleAlertRest는 resetAlertCount를 참조하므로 ref bridge 패턴 사용
    const onAlertRestRef = useRef(null);
    const handleAlertRestBridge = useCallback((minutes) => {
        onAlertRestRef.current?.(minutes);
    }, []);

    const {
        alertStep,
        alertLog,
        integratedScore, // { score, status, violations, itemScores }
        handleContinue,
        handleRest,
        resetAlert,
        resetAlertCount,
    } = useDrowsyAlert(
        drowsy.result,
        tabStats,
        alertStats,
        drowsy.running,
        handleAlertRestBridge,
        thresholds,
        currentMode,
        drowsy.setAlertStep, // 경고 단계 → useDrowsyDetection 전달 (집중 시간 제어용)
    );

    const handleAlertRest = useCallback(
        (minutes) => {
            drowsy.stop();
            resetAlertCount();
            resetAlertStats(); // 휴식 후 재시작 시 팝업 판단용 탭 카운트 리셋
            if (minutes) {
                setRestTimerMinutes(minutes);
                startRestCountdown(minutes);
            }
        },
        [drowsy, resetAlertCount, resetAlertStats, startRestCountdown],
    );

    // ref에 최신 콜백 동기화
    useEffect(() => {
        onAlertRestRef.current = handleAlertRest;
    }, [handleAlertRest]);

    // 차단/허용 목록 — content.js 통해 chrome.storage 연동
    const [sites, setSites] = useState(DEFAULT_SITES);
    const [allowedSites, setAllowedSites] = useState([]);

    // 금지 해제 팝업
    const [unblockSite, setUnblockSite] = useState(null);

    // drowsy.running을 ref로 관리 — useEffect 클로저 고정 방지
    const drowsyRunningRef = useRef(drowsy.running);
    useEffect(() => {
        drowsyRunningRef.current = drowsy.running;
    }, [drowsy.running]);

    useEffect(() => {
        window.postMessage({ type: "LOAD_SITES" }, FOCUS_TRACKER_ORIGIN);
        window.postMessage(
            { type: "LOAD_ALLOWED_SITES" },
            FOCUS_TRACKER_ORIGIN,
        );
        const handleMessage = (e) => {
            if (e.origin !== FOCUS_TRACKER_ORIGIN) return;
            if (e.data?.type === "SITES_LOADED" && e.data.sites)
                setSites(e.data.sites);
            if (e.data?.type === "ALLOWED_SITES_LOADED" && e.data.sites)
                setAllowedSites(e.data.sites);
            // 세션 진행 중일 때만 금지 해제 팝업 표시
            if (e.data?.type === "BLOCKED_TWICE" && drowsyRunningRef.current)
                setUnblockSite(e.data.site);
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const [options, setOptions] = useState({ allowPopup: false });
    const [toastVisible, setToastVisible] = useState(false);

    // 설정 저장 전 스냅샷 — 저장 없이 닫으면 되돌림
    const settingsSnapshotRef = useRef(null);

    const handleUnblockConfirm = () => {
        if (!unblockSite) return;
        const updated = sites.filter((s) => s !== unblockSite);
        setSites(updated);
        window.postMessage(
            { type: "SAVE_SITES", sites: updated },
            FOCUS_TRACKER_ORIGIN,
        );
        setUnblockSite(null);
    };
    const handleUnblockCancel = () => setUnblockSite(null);

    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 2400);
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

    const handleStart = () => {
        if (!hasStarted) {
            sessionStartTimeRef.current = new Date().toISOString();
        }
        if (hasStarted) setRestCount((p) => p + 1);
        setHasStarted(true);
        clearRestTimer();
        resetAlertStats(); // 재시작 시 팝업 판단용 탭 카운트 리셋
        resetAlertCount(); // 휴식 후 재시작 시 경고 단계 리셋 (alertLog는 유지)
        drowsy.start();
    };

    // content.js에 저장 요청
    const handleSave = () => {
        window.postMessage({ type: "SAVE_SITES", sites }, FOCUS_TRACKER_ORIGIN);
        window.postMessage(
            { type: "SAVE_ALLOWED_SITES", sites: allowedSites },
            FOCUS_TRACKER_ORIGIN,
        );
        window.postMessage(
            { type: "SAVE_ALLOW_POPUP", value: options.allowPopup },
            FOCUS_TRACKER_ORIGIN,
        );
        // 저장 완료 시 스냅샷 갱신 — 이후 닫아도 되돌리지 않음
        settingsSnapshotRef.current = {
            sites,
            allowedSites,
            options,
        };
        setToastVisible(true);
    };

    const handleToastHide = useCallback(() => setToastVisible(false), []);
    const [prevPage, setPrevPage] = useState("main");

    const handleSettingsOpen = () => {
        // 설정 열기 전 현재 값 스냅샷 저장
        settingsSnapshotRef.current = {
            sites,
            allowedSites,
            options,
        };
        setToastVisible(false); // 이전 토스트 초기화
        setPrevPage(page);
        setPage("settings");
    };

    const handleClose = () => {
        // 저장 없이 닫으면 스냅샷으로 되돌림
        if (settingsSnapshotRef.current) {
            setSites(settingsSnapshotRef.current.sites);
            setAllowedSites(settingsSnapshotRef.current.allowedSites);
            setOptions(settingsSnapshotRef.current.options);
            settingsSnapshotRef.current = null;
        }
        setPage(prevPage);
    };

    // 세션 종료 시 result + alertLog + integratedScore 스냅샷 저장 + DB 저장 + 웹캠 중지 + 데이터 초기화
    const handleEnd = () => {
        const result = { ...drowsy.result };
        const currentAlertLog = [...alertLog];

        setSessionSnapshot({
            ...result,
            alertLog: currentAlertLog,
            integratedScore: { ...integratedScore }, // 종합 점수 스냅샷 포함
        });

        saveSession({
            mode: MODE_MAP[currentMode] ?? "LECTURE",
            focusTime: Math.round(result.focusSeconds ?? 0),
            nonFocusTime: Math.round(result.nonFocusSeconds ?? 0),
            totalTime: Math.round(result.totalSeconds ?? 0),
            focusScore: Math.round(integratedScore?.score ?? 0), // 종합 집중도 점수
            alertCount: currentAlertLog.length,
            maxFocusTime: Math.round(result.maxFocusSeconds ?? 0), // 최대 집중 시간
        }).catch((e) => console.error("세션 저장 실패:", e));

        drowsy.stop();
        drowsy.reset();
        resetTabs();
        resetAlert();
        clearRestTimer();
        setHasStarted(false);
        setRestCount(0);
        setRestSeconds(0);
        sessionStartTimeRef.current = null;
        setPage("report");
    };

    // 마이페이지 진입 — 세션 종료 후 데이터 초기화
    const handleMyPageOpen = () => {
        if (drowsy.running || hasStarted) {
            setSessionSnapshot({
                ...drowsy.result,
                alertLog,
                integratedScore: { ...integratedScore },
            });
            drowsy.stop();
            drowsy.reset();
            resetTabs();
            resetAlert();
            clearRestTimer();
            setHasStarted(false);
            setRestCount(0);
            setRestSeconds(0);
            sessionStartTimeRef.current = null;
        }
        setPage("mypage");
    };

    // 로그인 / 회원가입 / 로그아웃 핸들러
    const handleLogin = (userInfo) => {
        setUser(userInfo);
        setPage("start");
    };
    const handleSignupPage = () => setPage("signup");
    const handleSignupComplete = () => setPage("login");
    const handleLogout = () => {
        logout().catch((e) => console.error("로그아웃 실패:", e));
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("focusAlertVolume");
        // chrome.storage 차단/허용 목록 초기화
        window.postMessage(
            { type: "SAVE_SITES", sites: DEFAULT_SITES },
            FOCUS_TRACKER_ORIGIN,
        );
        window.postMessage(
            { type: "SAVE_ALLOWED_SITES", sites: [] },
            FOCUS_TRACKER_ORIGIN,
        );
        window.postMessage(
            { type: "SAVE_ALLOW_POPUP", value: false },
            FOCUS_TRACKER_ORIGIN,
        );
        // state 초기화
        setSites(DEFAULT_SITES);
        setAllowedSites([]);
        setThresholds({});
        setOptions({ allowPopup: false });
        setUser(null);
        setPage("login");
    };

    // 세션 초기화
    const handleReset = () => {
        drowsy.reset();
        resetTabs();
        resetAlert();
        clearRestTimer();
        setHasStarted(false);
        setRestCount(0);
        setRestSeconds(0);
        sessionStartTimeRef.current = null;
    };

    const showHeader =
        page === "main" || page === "settings" || page === "mypage";

    return (
        <>
            {showSplash && <SplashScreen logo={logo} />}

            {/* 금지 해제 팝업 */}
            <UnblockModal
                site={unblockSite}
                onConfirm={handleUnblockConfirm}
                onCancel={handleUnblockCancel}
            />

            {/* 로그인 */}
            {!showSplash && page === "login" && (
                <LoginPage onLogin={handleLogin} onSignup={handleSignupPage} />
            )}

            {/* 회원가입 */}
            {!showSplash && page === "signup" && (
                <SignupPage
                    onSignupComplete={handleSignupComplete}
                    onBack={() => setPage("login")}
                />
            )}

            {/* 세션 선택 */}
            {!showSplash && page === "start" && (
                <SessionSelectPage
                    onSession={() => setPage("modeSelect")}
                    onMyPage={handleMyPageOpen}
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
                    onModeChange={() => setPage("modeSelect")}
                    onExit={handleLogout}
                />
            )}

            {/* 헤더 — main/settings/mypage에서 표시 */}
            {showHeader && (
                <Header
                    currentMode={currentMode}
                    onModeSelect={handleModeSelect}
                    modeChangeable={!hasStarted}
                    onSettingsOpen={handleSettingsOpen}
                    onMyPageOpen={handleMyPageOpen}
                    onLogout={handleLogout}
                    onGoMain={() => setPage("main")}
                />
            )}

            {/* MainPage — 언마운트 없이 숨김 처리 (MediaPipe video 태그 유지용) */}
            {!showSplash && (page === "main" || page === "settings") && (
                <div style={{ display: page === "main" ? "block" : "none" }}>
                    <MainPage
                        currentMode={currentMode}
                        drowsy={drowsy}
                        videoRef={drowsyVideoRef}
                        tabStats={tabStats}
                        restCount={restCount}
                        restSeconds={restSeconds}
                        onStart={handleStart}
                        onEnd={handleEnd}
                        onReset={handleReset}
                        alertStep={alertStep}
                        onAlertContinue={() => {
                            handleContinue();
                            resetAlertStats(); // 계속하기 시 팝업 판단용 탭 카운트 리셋
                        }}
                        onAlertRest={handleRest}
                        restTimerMinutes={restTimerMinutes}
                        onRestTimerMinutesChange={setRestTimerMinutes}
                        restTimeLeft={restTimeLeft}
                        showRestDonePopup={showRestDonePopup}
                        onRestDonePopupClose={() => setShowRestDonePopup(false)}
                        onRestTimerStart={startRestCountdown}
                        integratedScore={integratedScore}
                    />
                </div>
            )}

            {/* 설정 */}
            {page === "settings" && (
                <SettingsPage
                    currentMode={currentMode}
                    sites={sites}
                    onSiteAdd={(s) => setSites((p) => [...p, s])}
                    onSiteRemove={(s) =>
                        setSites((p) => p.filter((x) => x !== s))
                    }
                    allowedSites={allowedSites}
                    onAllowedSiteAdd={(s) => setAllowedSites((p) => [...p, s])}
                    onAllowedSiteRemove={(s) =>
                        setAllowedSites((p) => p.filter((x) => x !== s))
                    }
                    options={options}
                    onOptionChange={(k, v) =>
                        setOptions((p) => ({ ...p, [k]: v }))
                    }
                    toastVisible={toastVisible}
                    onToastHide={handleToastHide}
                    onSave={handleSave}
                    onClose={handleClose}
                />
            )}

            {/* 마이페이지 */}
            {page === "mypage" && <MyPage />}
        </>
    );
}
