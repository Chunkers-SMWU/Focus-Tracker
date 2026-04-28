import { modeData } from "../data/modeData";

const modeIcons = { 강의: "🎓", 자료: "🔍", 잠금: "🔒", 휴식: "😴" };
const modeNames = {
    강의: "강의시청",
    자료: "자료검색",
    잠금: "잠금",
    휴식: "휴식",
};
const modeDescs = {
    강의: "엄격한 집중",
    자료: "검색 허용",
    잠금: "최고 강도",
    휴식: "시간 제한만",
};

export default function ModeSelector({ currentMode, onSelect }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
            }}
        >
            {Object.keys(modeData).map((mode) => (
                <div
                    key={mode}
                    onClick={() => onSelect(mode)}
                    style={{
                        background: currentMode === mode ? "#eff6ff" : "#fff",
                        border:
                            currentMode === mode
                                ? "2px solid #2563eb"
                                : "1px solid #e5e5e5",
                        borderRadius: 10,
                        padding: "14px 10px",
                        cursor: "pointer",
                        textAlign: "center",
                        userSelect: "none",
                    }}
                >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>
                        {modeIcons[mode]}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {modeNames[mode]}
                    </div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
                        {modeDescs[mode]}
                    </div>
                </div>
            ))}
        </div>
    );
}
