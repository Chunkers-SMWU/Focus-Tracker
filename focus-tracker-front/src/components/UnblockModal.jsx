import styles from "./UnblockModal.module.css";

export default function UnblockModal({ site, onConfirm, onCancel }) {
    if (!site) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <span className={styles.emoji}>🚫</span>
                <p className={styles.title}>금지 사이트 해제</p>
                <p className={styles.desc}>
                    <b>{site}</b>에 2회 접속했어요.
                    <br />
                    금지 목록에서 해제할까요?
                </p>
                <div className={styles.btnRow}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        취소
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        해제
                    </button>
                </div>
            </div>
        </div>
    );
}
