const ITEMS = [
    { key: "tabSwitch", label: "탭 전환 횟수", unit: "회" },
    { key: "tabAway", label: "탭 이탈 누적 시간", unit: "초" },
    { key: "rapidSwitch", label: "짧은 간격 반복 전환", unit: "회" },
    { key: "blockedAccess", label: "허용되지 않은 창 접속", unit: "회" },
];

export default function TabStats({ stats = {} }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: "12px 20px",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: 8,
                }}
            >
                탭 활동
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {ITEMS.map((item, i) => (
                    <div
                        key={item.key}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 0",
                            borderBottom:
                                i < ITEMS.length - 1
                                    ? "1px solid #f5f5f5"
                                    : "none",
                            fontSize: 12,
                        }}
                    >
                        <span style={{ color: "#888" }}>{item.label}</span>
                        <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                            {stats[item.key] != null
                                ? `${stats[item.key]}${item.unit}`
                                : "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
