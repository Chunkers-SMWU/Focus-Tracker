import { useState } from "react";
import ThresholdTable from "../components/settings/ThresholdTable";
import BlockedSiteList from "../components/settings/BlockedSiteList";
import OptionToggles from "../components/settings/OptionToggles";
import Toast from "../components/Toast";
import { modeData } from "../data/modeData";
import styles from "./SettingsPage.module.css";

const VOLUME_KEY = "focusAlertVolume";

export default function SettingsPage({
    currentMode,
    thresholds,
    onThresholdChange,
    sites,
    onSiteAdd,
    onSiteRemove,
    allowedSites,
    onAllowedSiteAdd,
    onAllowedSiteRemove,
    options,
    onOptionChange,
    toastVisible,
    onToastHide,
    onSave: onSaveOrig,
    onClose,
}) {
    const badge = modeData[currentMode].label;

    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem(VOLUME_KEY);
        return saved !== null ? Number(saved) : 70;
    });

    const handleVolumeChange = (e) => {
        setVolume(Number(e.target.value));
    };

    const handleSave = () => {
        localStorage.setItem(VOLUME_KEY, volume);
        onSaveOrig();
    };

    /** 볼륨 미리 듣기 */
    const handleVolumePreview = () => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.value = volume / 100;
            osc.frequency.value = 880;
            osc.type = "sine";
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
            osc.onended = () => ctx.close();
        } catch (e) {
            console.warn("미리 듣기 실패:", e);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* 페이지 헤더 */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>설정</h1>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="설정 닫기"
                    >
                        ✕
                    </button>
                </div>

                <Section title="경고음 설정">
                    <div className={styles.volumeRow}>
                        <span className={styles.volumeLabel}>경고음 볼륨</span>
                        <div className={styles.volumeControls}>
                            <span className={styles.volumeIcon}>🔈</span>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={volume}
                                onChange={handleVolumeChange}
                                className={styles.volumeSlider}
                            />
                            <span className={styles.volumeIcon}>🔊</span>
                            <span className={styles.volumeValue}>{volume}</span>
                            <button
                                className={styles.previewBtn}
                                onClick={handleVolumePreview}
                            >
                                미리 듣기
                            </button>
                        </div>
                    </div>
                </Section>

                <Section
                    title={
                        <>
                            탭 활동 경고 기준
                            <span className={styles.badge}>{badge}모드</span>
                        </>
                    }
                >
                    <ThresholdTable
                        currentMode={currentMode}
                        thresholds={thresholds}
                        onChange={onThresholdChange}
                    />
                </Section>

                <Section title="허용 페이지 설정">
                    <BlockedSiteList
                        sites={allowedSites}
                        onAdd={onAllowedSiteAdd}
                        onRemove={onAllowedSiteRemove}
                        placeholder="허용할 사이트 입력 (예: snowboard.sookmyung.ac.kr)"
                    />
                </Section>

                <Section title="금지 페이지 설정">
                    <BlockedSiteList
                        sites={sites}
                        onAdd={onSiteAdd}
                        onRemove={onSiteRemove}
                        placeholder="금지할 사이트 입력 (예: youtube.com)"
                    />
                </Section>

                <Section title="기타 설정">
                    <OptionToggles
                        options={options}
                        onChange={onOptionChange}
                        currentMode={currentMode}
                    />
                </Section>

                {/* 설정 저장 버튼 */}
                <div className={styles.btnRow}>
                    <button className={styles.saveBtn} onClick={handleSave}>
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
        <div className={styles.section}>
            <div className={styles.sectionLabel}>{title}</div>
            <div className={styles.sectionBox}>{children}</div>
        </div>
    );
}
