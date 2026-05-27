import styles from "./SessionSelectPage.module.css";

const cards = [
    {
        key: "session",
        label: "세션 시작",
        desc: "집중 모드를 선택하고\n새로운 세션을 시작합니다",
        color: "#2563eb",
        bg: "#eff6ff",
        border: "#bfdbfe",
        icon: "🎯",
    },
    {
        key: "mypage",
        label: "마이 페이지",
        desc: "지난 세션 기록을\n달력으로 확인합니다",
        color: "#7c3aed",
        bg: "#f5f3ff",
        border: "#ddd6fe",
        icon: "📅",
    },
];

export default function SessionSelectPage({ onSession, onMyPage }) {
    return (
        <div className={styles.container}>
            <p className={styles.brand}>Focus Tracker</p>
            <h1 className={styles.title}>무엇을 하시겠어요?</h1>
            <p className={styles.subtitle}>원하는 항목을 선택하세요</p>

            <div className={styles.grid}>
                {cards.map((card) => (
                    <SelectCard
                        key={card.key}
                        card={card}
                        onSelect={card.key === "session" ? onSession : onMyPage}
                    />
                ))}
            </div>
        </div>
    );
}

function SelectCard({ card, onSelect }) {
    return (
        <button
            className={styles.card}
            onClick={onSelect}
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
            <div className={styles.cardLabel}>{card.label}</div>
            <div
                className={styles.cardImage}
                style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                }}
            >
                <span className={styles.cardIcon}>{card.icon}</span>
            </div>
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
