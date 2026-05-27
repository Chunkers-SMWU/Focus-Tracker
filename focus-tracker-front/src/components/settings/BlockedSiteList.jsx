import { useState } from "react";
import styles from "./BlockedSiteList.module.css";

export default function BlockedSiteList({
    sites,
    onAdd,
    onRemove,
    placeholder,
}) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
        const val = input.trim();
        if (!val) return;
        onAdd(val);
        setInput("");
    };

    return (
        <div>
            <div className={styles.list}>
                {sites.map((site) => (
                    <div key={site} className={styles.siteItem}>
                        <span>{site}</span>
                        <button
                            className={styles.removeBtn}
                            onClick={() => onRemove(site)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.inputRow}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder={placeholder}
                />
                <button className={styles.addBtn} onClick={handleAdd}>
                    + 추가
                </button>
            </div>
        </div>
    );
}
