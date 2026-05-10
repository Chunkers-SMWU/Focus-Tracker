import DrowsyMonitor from "../components/DrowsyMonitor";
import FocusRings from "../components/FocusRings";
import FocusTimeChart from "../components/FocusTimeChart";
import TabStats from "../components/TabStats";

const modeLabels = {
    강의: "강의시청",
    자료: "자료검색",
    잠금: "잠금",
    휴식: "휴식",
};
const modeColors = {
    강의: "#2563eb",
    자료: "#16a34a",
    잠금: "#dc2626",
    휴식: "#9333ea",
};

export default function MainPage({ currentMode, drowsy, onEnd, onReset }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "calc(100vh - 56px)",
                background: "#fff",
                gap: 12,
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
                padding: "0 1.5rem 10px",
                boxSizing: "border-box",
            }}
        >
            {/* 모드 이름 */}
            <p
                style={{
                    fontSize: 14,
                    color: "#999",
                    letterSpacing: "0.05em",
                    marginTop: 10,
                    marginBottom: 0,
                }}
            >
                CURRENT MODE
            </p>
            <p
                style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: modeColors[currentMode],
                    letterSpacing: "-0.02em",
                    marginBottom: 0,
                }}
            >
                {modeLabels[currentMode]}
            </p>

            {/* 메인 그리드 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "4fr 5fr",
                    gap: 16,
                    width: "100%",
                    maxWidth: 1000,
                    boxSizing: "border-box",
                    alignItems: "start",
                    marginTop: 20,
                }}
            >
                {/* 왼쪽 열 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <DrowsyMonitor
                        result={drowsy.result}
                        error={drowsy.error}
                        running={drowsy.running}
                        onStart={drowsy.start}
                        onStop={drowsy.stop}
                        videoRef={drowsy.videoRef}
                    />
                    <FocusTimeChart
                        totalSeconds={drowsy.result.totalSeconds}
                        focusSeconds={drowsy.result.focusSeconds}
                        nonFocusSeconds={drowsy.result.nonFocusSeconds}
                    />
                </div>

                {/* 오른쪽 열 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <FocusRings
                        result={drowsy.result}
                        currentMode={currentMode}
                    />
                    <TabStats stats={{}} />
                </div>
            </div>

            {/* 하단 버튼 */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                    onClick={onReset}
                    style={{
                        padding: "8px 28px",
                        background: "#fff",
                        color: "#888",
                        border: "1px solid #e5e5e5",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#888";
                        e.currentTarget.style.color = "#1a1a1a";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e5e5";
                        e.currentTarget.style.color = "#888";
                    }}
                >
                    세션 초기화
                </button>
                <button
                    onClick={onEnd}
                    style={{
                        padding: "8px 28px",
                        background: "#fff",
                        color: "#888",
                        border: "1px solid #e5e5e5",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#dc2626";
                        e.currentTarget.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e5e5";
                        e.currentTarget.style.color = "#888";
                    }}
                >
                    세션 종료
                </button>
            </div>
        </div>
    );
}
