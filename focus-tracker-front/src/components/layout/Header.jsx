import { useState } from "react";
import styles from "./Header.module.css";

const modeNavItems = {
    강의: { icon: "🎓", label: "강의시청" },
    자료: { icon: "🔍", label: "자료검색" },
    잠금: { icon: "🔒", label: "잠금" },
    휴식: { icon: "😴", label: "휴식" },
};

export default function Header({
    currentMode,
    onModeSelect,
    onSettingsOpen,
    onLogout,
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <header className={styles.header}>
            {/* 로고 */}
            <span className={styles.logo}>Focus-Tracker</span>

            {/* 모드 탭 */}
            <nav
                className={styles.nav}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    // hovered 기반 동적 값
                    gap: hovered ? 4 : 0,
                    transition: "gap 0.4s ease",
                }}
            >
                <div
                    className={styles.modeLabel}
                    style={{
                        // hovered 기반 동적 값
                        width: hovered ? 0 : 72,
                        opacity: hovered ? 0 : 1,
                        transition: "width 0.4s ease, opacity 0.2s ease",
                    }}
                >
                    MODE
                </div>

                {Object.entries(modeNavItems).map(([mode, { icon, label }]) => (
                    <button
                        key={mode}
                        onClick={() => onModeSelect(mode)}
                        className={styles.modeBtn}
                        style={{
                            // hovered/currentMode 기반 동적 값
                            maxWidth: hovered ? 120 : 0,
                            opacity: hovered ? 1 : 0,
                            padding: hovered ? "6px 16px" : "6px 0",
                            fontWeight: currentMode === mode ? 600 : 400,
                            background:
                                currentMode === mode
                                    ? "#2563eb"
                                    : "transparent",
                            color:
                                currentMode === mode
                                    ? "#fff"
                                    : "rgba(255,255,255,0.55)",
                            transition:
                                "max-width 0.4s ease, opacity 0.35s ease, padding 0.4s ease, background 0.18s ease",
                        }}
                    >
                        <span>{icon}</span>
                        <span>{label}</span>
                    </button>
                ))}
            </nav>

            {/* 우측 버튼 그룹 */}
            <div className={styles.btnGroup}>
                <button className={styles.headerBtn} onClick={onSettingsOpen}>
                    Settings
                </button>
                <button className={styles.headerBtn} onClick={onLogout}>
                    로그아웃
                </button>
            </div>
        </header>
    );
}
