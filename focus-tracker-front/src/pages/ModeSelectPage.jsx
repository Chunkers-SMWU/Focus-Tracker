const modeCards = [
    {
        key: "강의",
        label: "강의시청",
        desc: "영상 강의에 집중할 때\n엄격한 탭 이탈 감지",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    {
        key: "자료",
        label: "자료검색",
        desc: "검색은 허용하되\n유해 사이트만 차단",
        color: "#16a34a",
        bg: "#f0fdf4",
        border: "#bbf7d0",
    },
    {
        key: "잠금",
        label: "잠금",
        desc: "최고 강도 집중 모드\n모든 이탈 즉시 경고",
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
    },
    {
        key: "휴식",
        label: "휴식",
        desc: "시간 제한만 적용\n자유롭게 쉬는 시간",
        color: "#9333ea",
        bg: "#faf5ff",
        border: "#e9d5ff",
    },
];

const modeIcons = {
    강의: "🎓",
    자료: "🔍",
    잠금: "🔒",
    휴식: "😴",
};

export default function ModeSelectPage({ onSelect }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff", // 메인화면과 동일한 흰색 배경
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1rem",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
        >
            {/* 타이틀 */}
            <p
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2563eb", // 헤더/버튼의 브랜드 컬러
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                }}
            >
                Focus Tracker
            </p>
            <h1
                style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#1a1a1a", // 메인/설정 화면 기본 텍스트 색
                    letterSpacing: "-0.02em",
                    marginBottom: 6,
                    textAlign: "center",
                }}
            >
                모드를 선택하세요
            </h1>
            <p
                style={{
                    fontSize: 13,
                    color: "#888", // 설정 화면 섹션 라벨과 동일한 색
                    marginBottom: 36,
                    textAlign: "center",
                }}
            >
                선택한 모드로 집중 세션이 시작됩니다
            </p>

            {/* 카드 그리드 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 24,
                    width: "100%",
                    maxWidth: 890,
                }}
            >
                {modeCards.map((card) => (
                    <ModeCard key={card.key} card={card} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
}

function ModeCard({ card, onSelect }) {
    return (
        <button
            onClick={() => onSelect(card.key)}
            style={{
                minHeight: 360,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                background: "#fff",
                border: "1.5px solid #e5e5e5", // 설정 화면 카드와 동일한 테두리
                borderRadius: 12, // 설정 화면 Section과 동일한 radius
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                overflow: "hidden",
                transition:
                    "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(0,0,0,0.10)";
                e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e5e5e5";
            }}
        >
            {/* 모드 이름 */}
            <div
                style={{
                    padding: "16px 16px 8px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 7,
                }}
            >
                {card.label}
            </div>

            {/* 이미지 Placeholder */}
            <div
                style={{
                    height: 200,
                    margin: "10px 16px",
                    borderRadius: 8,
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: 28 }}>{modeIcons[card.key]}</span>
            </div>

            {/* 설명 + 화살표 */}
            <div
                style={{
                    padding: "10px 14px 14px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                <p
                    style={{
                        fontSize: 11,
                        color: "#888",
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: "pre-line",
                    }}
                >
                    {card.desc}
                </p>
                <span
                    style={{
                        fontSize: 16,
                        color: card.color,
                        flexShrink: 0,
                        lineHeight: 1,
                    }}
                >
                    →
                </span>
            </div>
        </button>
    );
}
