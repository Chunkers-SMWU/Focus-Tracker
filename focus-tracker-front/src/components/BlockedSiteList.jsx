import { useState } from "react";

export default function BlockedSiteList({ sites, onAdd, onRemove }) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
        const val = input.trim();
        if (!val) return;
        onAdd(val);
        setInput("");
    };

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sites.map((site) => (
                    <div
                        key={site}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "9px 12px",
                            background: "#fafafa",
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            fontSize: 13,
                        }}
                    >
                        <span>{site}</span>
                        <button
                            onClick={() => onRemove(site)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#ccc",
                                fontSize: 18,
                                lineHeight: 1,
                                padding: "0 4px",
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="차단할 사이트 입력 (예: tiktok.com)"
                    style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 13,
                        background: "#fafafa",
                    }}
                />
                <button
                    onClick={handleAdd}
                    style={{
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontSize: 13,
                        cursor: "pointer",
                    }}
                >
                    + 추가
                </button>
            </div>
        </div>
    );
}
