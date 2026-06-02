import { useState } from "react";
import styles from "./DrowsyAlertModal.module.css";

const STEP_CONFIG = {
    1: {
        emoji: "😴",
        title: "졸음이 감지됐어요",
        desc: "잠깐 환기하거나 물 한 잔 마시는 건 어떨까요?",
    },
    2: {
        emoji: "⚠️",
        title: "졸음 경고",
        desc: "집중도가 많이 떨어졌어요. 휴식을 권장해요.",
    },
    3: {
        emoji: "🚨",
        title: "강제 휴식",
        desc: "지속적인 졸음이 감지됐어요. 지금 바로 휴식을 취해 주세요.",
    },
};

export default function DrowsyAlertModal({ step, onContinue, onRest }) {
    const [restMinutes, setRestMinutes] = useState(0);

    if (!step) return null;

    const { emoji, title, desc } = STEP_CONFIG[step];
    const handleRest = () => onRest(restMinutes > 0 ? restMinutes : null);

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${styles[`step${step}`]}`}>
                <span className={styles.emoji}>{emoji}</span>
                <p className={styles.title}>{title}</p>
                <p className={styles.desc}>{desc}</p>

                {/* 3단계에서만 휴식 타이머 설정 표시 */}
                {step === 3 && (
                    <div className={styles.timerSetting}>
                        <span className={styles.timerLabel}>휴식 타이머</span>
                        <div className={styles.timerControls}>
                            <button
                                className={styles.timerBtn}
                                onClick={() =>
                                    setRestMinutes((p) => Math.max(0, p - 1))
                                }
                            >
                                −
                            </button>
                            <span className={styles.timerValue}>
                                {restMinutes === 0
                                    ? "없음"
                                    : `${restMinutes}분`}
                            </span>
                            <button
                                className={styles.timerBtn}
                                onClick={() =>
                                    setRestMinutes((p) => Math.min(60, p + 1))
                                }
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.btnRow}>
                    {step < 3 && (
                        <button
                            className={styles.continueBtn}
                            onClick={onContinue}
                        >
                            집중 이어가기
                        </button>
                    )}
                    <button className={styles.restBtn} onClick={handleRest}>
                        휴식하기
                    </button>
                </div>
            </div>
        </div>
    );
}
