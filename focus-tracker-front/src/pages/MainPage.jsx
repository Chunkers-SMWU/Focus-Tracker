import DrowsyMonitor from "../components/DrowsyMonitor";
import FocusRings from "../components/FocusRings";
import FocusTimeChart from "../components/FocusTimeChart";

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

export default function MainPage({ currentMode, drowsy, onEnd }) {
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
                padding: "0 1.5rem 2rem",
                boxSizing: "border-box",
            }}
        >
            {/* 모드 이름 */}
            <p
                style={{
                    fontSize: 14,
                    color: "#999",
                    letterSpacing: "0.05em",
                    marginTop: 32,
                    marginBottom: 0,
                }}
            >
                CURRENT MODE
            </p>
            <p
                style={{
                    fontSize: 36,
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
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "auto auto",
                    gap: 24,
                    width: "100%",
                    maxWidth: 1200,
                    boxSizing: "border-box",
                    alignItems: "stretch",
                    marginTop: 20,
                }}
            >
                {/* 졸음 감지 — 왼쪽 위 */}
                <div style={{ gridColumn: 1, gridRow: 1 }}>
                    <DrowsyMonitor
                        result={drowsy.result}
                        error={drowsy.error}
                        running={drowsy.running}
                        onStart={drowsy.start}
                        onStop={drowsy.stop}
                        videoRef={drowsy.videoRef}
                    />
                </div>

                {/* FocusRings — 오른쪽, 2행 전체 */}
                <div
                    style={{
                        gridColumn: 2,
                        gridRow: "1 / 3",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <FocusRings
                        result={drowsy.result}
                        currentMode={currentMode}
                    />
                </div>

                {/* 집중 시간 차트 — 왼쪽 아래 */}
                <div style={{ gridColumn: 1, gridRow: 2 }}>
                    <FocusTimeChart
                        totalSeconds={drowsy.result.totalSeconds}
                        focusSeconds={drowsy.result.focusSeconds}
                        running={drowsy.running}
                    />
                </div>
            </div>

            {/* 세션 종료 버튼 */}
            <button
                onClick={onEnd}
                style={{
                    marginTop: 24,
                    padding: "10px 40px",
                    background: "#fff",
                    color: "#888",
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    fontSize: 14,
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
    );
}
