import ThresholdTable from "../components/settings/ThresholdTable";
import BlockedSiteList from "../components/settings/BlockedSiteList";
import OptionToggles from "../components/settings/OptionToggles";
import Toast from "../components/Toast";
import { modeData } from "../data/modeData";
import styles from "./SettingsPage.module.css";

export default function SettingsPage({
    currentMode,
    thresholds,
    onThresholdChange,
    sites,
    onSiteAdd,
    onSiteRemove,
    options,
    onOptionChange,
    restMinutes,
    onRestMinutesChange,
    toastVisible,
    onToastHide,
    onSave,
    onClose,
}) {
    const badge = modeData[currentMode].label;

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* 페이지 헤더 */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>브라우저 탭 설정</h1>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="설정 닫기"
                    >
                        ✕
                    </button>
                </div>

                <Section
                    title={
                        <>
                            경고창 팝업 기준
                            <span className={styles.badge}>{badge}</span>
                        </>
                    }
                >
                    <ThresholdTable
                        currentMode={currentMode}
                        thresholds={thresholds}
                        onChange={onThresholdChange}
                    />
                </Section>

                <Section title="금지 페이지 설정">
                    <BlockedSiteList
                        sites={sites}
                        onAdd={onSiteAdd}
                        onRemove={onSiteRemove}
                    />
                </Section>

                <Section title="선택 기능">
                    <OptionToggles
                        options={options}
                        onChange={onOptionChange}
                        currentMode={currentMode}
                        restMinutes={restMinutes}
                        onRestMinutesChange={onRestMinutesChange}
                    />
                </Section>

                {/* 설정 저장 버튼 — 가운데 정렬 고정 너비 */}
                <div className={styles.btnRow}>
                    <button className={styles.saveBtn} onClick={onSave}>
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
