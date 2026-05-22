import DrowsyMonitor from "../components/DrowsyMonitor";
import FocusRings from "../components/FocusRings";
import FocusTimeChart from "../components/FocusTimeChart";
import TabStats from "../components/TabStats";
import styles from "./MainPage.module.css";

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

export default function MainPage({
    currentMode,
    drowsy,
    tabStats,
    onEnd,
    onReset,
}) {
    return (
        <div className={styles.container}>
            {/* 모드 이름 */}
            <p className={styles.modeLabel}>CURRENT MODE</p>
            <p
                className={styles.modeName}
                style={{ color: modeColors[currentMode] }}
            >
                {modeLabels[currentMode]}
            </p>

            {/* 메인 그리드 */}
            <div className={styles.grid}>
                {/* 왼쪽 열 */}
                <div className={styles.col}>
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
                <div className={styles.col}>
                    <FocusRings
                        result={drowsy.result}
                        currentMode={currentMode}
                    />
                    <TabStats stats={tabStats} />
                </div>
            </div>

            {/* 하단 버튼 */}
            <div className={styles.btnRow}>
                <button className={styles.resetBtn} onClick={onReset}>
                    세션 초기화
                </button>
                <button className={styles.endBtn} onClick={onEnd}>
                    세션 종료
                </button>
            </div>
        </div>
    );
}
