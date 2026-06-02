import FocusRings from "../components/FocusRings";
import FocusTimeChart from "../components/FocusTimeChart";
import TabStats from "../components/TabStats";
import RestStats from "../components/RestStats";
import DrowsyAlertModal from "../components/DrowsyAlertModal";
import styles from "./MainPage.module.css";

const modeLabels = { 강의: "강의시청", 자료: "자료검색", 잠금: "잠금" };
const modeColors = { 강의: "#2563eb", 자료: "#16a34a", 잠금: "#dc2626" };
const MAX_MINUTES = 60;

const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
};

export default function MainPage({
    currentMode,
    drowsy,
    videoRef,
    tabStats,
    restCount,
    restSeconds,
    onStart,
    onEnd,
    onReset,
    alertStep,
    onAlertContinue,
    onAlertRest,
    restTimerMinutes,
    onRestTimerMinutesChange,
    restTimeLeft,
    showRestDonePopup,
    onRestDonePopupClose,
    onRestTimerStart,
    integratedScore, // { score, status, violations, itemScores }
}) {
    const isResting = !drowsy.running;

    return (
        <div className={styles.container}>
            {/* video 태그 - MediaPipe가 videoRef로 웹캠을 읽음 */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
            />

            {/* 졸음 경고 팝업 */}
            <DrowsyAlertModal
                step={alertStep}
                onContinue={onAlertContinue}
                onRest={onAlertRest}
            />

            {/* 재시작 안내 팝업 */}
            {showRestDonePopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <button
                            className={styles.popupClose}
                            onClick={onRestDonePopupClose}
                        >
                            ✕
                        </button>
                        <span className={styles.popupEmoji}>⏰</span>
                        <p className={styles.popupTitle}>
                            휴식 시간이 끝났어요!
                        </p>
                        <p className={styles.popupDesc}>다시 집중해볼까요?</p>
                    </div>
                </div>
            )}

            {/* 모드 이름 */}
            <p className={styles.modeLabel}>CURRENT MODE</p>
            <p
                className={styles.modeName}
                style={{ color: modeColors[currentMode] }}
            >
                {modeLabels[currentMode]}
            </p>

            {/* 중간 3열: 휴식 | 집중 시간 | 탭 활동 */}
            <div className={styles.topGrid}>
                <div className={styles.restColumn}>
                    <RestStats
                        restCount={restCount}
                        restSeconds={restSeconds}
                    />

                    {/* 휴식 중일 때만 타이머 설정 표시 / 학습 중엔 카드 비활성화 */}
                    {isResting ? (
                        <div className={styles.restTimerBox}>
                            <p className={styles.restTimerLabel}>휴식 타이머</p>
                            <div className={styles.restTimerRight}>
                                <div className={styles.restTimerControls}>
                                    <button
                                        className={styles.restTimerBtn}
                                        onClick={() =>
                                            onRestTimerMinutesChange((p) =>
                                                Math.max(0, p - 1),
                                            )
                                        }
                                    >
                                        −
                                    </button>
                                    <span className={styles.restTimerValue}>
                                        {restTimerMinutes === 0
                                            ? "없음"
                                            : `${restTimerMinutes}분`}
                                    </span>
                                    <button
                                        className={styles.restTimerBtn}
                                        onClick={() =>
                                            onRestTimerMinutesChange((p) =>
                                                Math.min(MAX_MINUTES, p + 1),
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                                {restTimerMinutes > 0 &&
                                    restTimeLeft === null && (
                                        <button
                                            className={styles.restTimerStartBtn}
                                            onClick={() =>
                                                onRestTimerStart(
                                                    restTimerMinutes,
                                                )
                                            }
                                        >
                                            시작
                                        </button>
                                    )}
                                {restTimeLeft !== null && (
                                    <p className={styles.restCountdown}>
                                        {formatTime(restTimeLeft)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div
                            className={styles.restTimerBox}
                            aria-disabled="true"
                        >
                            <p className={styles.restTimerLabelDisabled}>
                                휴식 타이머
                            </p>
                            <p className={styles.restTimerDisabledMsg}>
                                학습 중에는 사용할 수 없어요
                            </p>
                        </div>
                    )}
                </div>

                <FocusTimeChart
                    totalSeconds={drowsy.result.totalSeconds}
                    focusSeconds={drowsy.result.focusSeconds}
                    nonFocusSeconds={drowsy.result.nonFocusSeconds}
                />
                <TabStats stats={tabStats} currentMode={currentMode} />
            </div>

            {/* 하단: 집중도 모니터링 */}
            <div className={styles.monitorRow}>
                <FocusRings
                    result={drowsy.result}
                    currentMode={currentMode}
                    integratedScore={integratedScore}
                />
            </div>

            {/* 버튼 행: 세션 초기화 | 시작/휴식 | 세션 종료 */}
            <div className={styles.btnRow}>
                <button className={styles.resetBtn} onClick={onReset}>
                    세션 초기화
                </button>
                <button
                    className={`${styles.startBtn} ${drowsy.running ? styles.startBtnRest : ""}`}
                    onClick={drowsy.running ? drowsy.stop : onStart}
                    style={{
                        background: drowsy.running ? "#f3f4f6" : "#2563eb",
                        color: drowsy.running ? "#555" : "#fff",
                        border: drowsy.running
                            ? "1px solid #e5e5e5"
                            : "1px solid transparent",
                    }}
                >
                    {drowsy.running ? "휴식" : "시작"}
                </button>
                <button className={styles.endBtn} onClick={onEnd}>
                    세션 종료
                </button>
            </div>
        </div>
    );
}
