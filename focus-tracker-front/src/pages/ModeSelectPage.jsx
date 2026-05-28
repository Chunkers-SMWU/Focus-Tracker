import styles from "./ModeSelectPage.module.css";

const modeCards = [
    {
        key: "강의시청",
        label: "강의시청",
        desc: "영상 강의에 집중할 때\n엄격한 탭 이탈 감지",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#bfdbfe",
    },
    {
        key: "자료검색",
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
];

const modeIcons = {
    강의: "🎓",
    자료: "🔍",
    잠금: "🔒",
};

export default function ModeSelectPage({ onSelect }) {
    return (
        <div className={styles.container}>
            {/* 타이틀 */}
            <p className={styles.brand}>Focus Tracker</p>
            <h1 className={styles.title}>모드를 선택하세요</h1>
            <p className={styles.subtitle}>
                선택한 모드로 집중 세션이 시작됩니다
            </p>

            {/* 카드 그리드 */}
            <div className={styles.grid}>
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
            className={styles.card}
            onClick={() => onSelect(card.key)}
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
            <div className={styles.cardLabel}>{card.label}</div>

            {/* 이미지 Placeholder */}
            <div
                className={styles.cardImage}
                style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                }}
            >
                <span className={styles.cardIcon}>{modeIcons[card.key]}</span>
            </div>

            {/* 설명 + 화살표 */}
            <div className={styles.cardFooter}>
                <p className={styles.cardDesc}>{card.desc}</p>
                <span
                    className={styles.cardArrow}
                    style={{ color: card.color }}
                >
                    →
                </span>
            </div>
        </button>
    );
}
