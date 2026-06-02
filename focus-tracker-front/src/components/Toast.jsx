import { useEffect } from "react";

export default function Toast({ visible, onHide }) {
    useEffect(() => {
        if (!visible) return;
        const t = setTimeout(onHide, 1500);
        return () => clearTimeout(t);
    }, [visible, onHide]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#1a1a1a",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: 20,
                fontSize: 13,
                zIndex: 999,
            }}
        >
            설정이 저장되었습니다!
        </div>
    );
}
