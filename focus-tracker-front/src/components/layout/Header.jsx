import { useState } from "react";

const modeNavItems = {
    강의: { icon: "🎓", label: "강의시청" },
    자료: { icon: "🔍", label: "자료검색" },
    잠금: { icon: "🔒", label: "잠금" },
    휴식: { icon: "😴", label: "휴식" },
};

export default function Header({ currentMode, onModeSelect, onSettingsOpen }) {
    const [hovered, setHovered] = useState(false);

    return (
        <>
            <style>{`
                .mode-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 999px;
                    border: none;
                    cursor: pointer;
                    font-size: 13px;
                    font-family: 'Pretendard','Apple SD Gothic Neo',sans-serif;
                    white-space: nowrap;
                    overflow: hidden;
                }
            `}</style>

            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "#1a1a1a",
                    padding: "0 2rem",
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* 로고 */}
                <span
                    style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        flexShrink: 0,
                        fontFamily:
                            "'Pretendard','Apple SD Gothic Neo',sans-serif",
                    }}
                >
                    Focus-Tracker
                </span>

                {/* 모드 탭 — position absolute로 항상 헤더 정중앙 고정 */}
                <nav
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: hovered ? 4 : 0,
                        background: "rgba(255,255,255,0.07)",
                        borderRadius: 999,
                        padding: "4px 6px",
                        transition: "gap 0.4s ease",
                        overflow: "hidden",
                    }}
                >
                    {/* 축소 상태: MODE 텍스트 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: hovered ? 0 : 72,
                            opacity: hovered ? 0 : 1,
                            overflow: "hidden",
                            transition: "width 0.4s ease, opacity 0.2s ease",
                            pointerEvents: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.6)",
                            letterSpacing: "0.1em",
                            fontFamily:
                                "'Pretendard','Apple SD Gothic Neo',sans-serif",
                            whiteSpace: "nowrap",
                        }}
                    >
                        MODE
                    </div>

                    {/* 확장 상태: 4개 버튼 */}
                    {Object.entries(modeNavItems).map(
                        ([mode, { icon, label }]) => (
                            <button
                                key={mode}
                                onClick={() => onModeSelect(mode)}
                                className="mode-btn"
                                style={{
                                    maxWidth: hovered ? 120 : 0,
                                    opacity: hovered ? 1 : 0,
                                    padding: hovered ? "6px 16px" : "6px 0",
                                    fontWeight:
                                        currentMode === mode ? 600 : 400,
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
                        ),
                    )}
                </nav>
                {/* Settings 버튼 */}
                <button
                    onClick={onSettingsOpen}
                    style={{
                        marginLeft: "auto",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 8,
                        padding: "6px 16px",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily:
                            "'Pretendard','Apple SD Gothic Neo',sans-serif",
                        transition: "background 0.15s",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.18)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.1)")
                    }
                >
                    Settings
                </button>
            </header>
        </>
    );
}
