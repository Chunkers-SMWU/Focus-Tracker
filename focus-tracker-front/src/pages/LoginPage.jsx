import { useState } from "react";

export default function LoginPage({ onLogin, onGuest, onSignup }) {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (!id.trim() || !pw.trim()) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }
        setError("");
        // TODO: Spring API 연결
        // 임시: 입력값이 있으면 로그인 성공 처리
        onLogin({ id });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1rem",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
        >
            <div style={{ width: "100%", maxWidth: 400 }}>
                {/* 로고 */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <p
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#2563eb",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                        }}
                    >
                        Focus Tracker
                    </p>
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#1a1a1a",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        로그인
                    </h1>
                </div>

                {/* 폼 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <Input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => {
                            setId(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={pw}
                        onChange={(e) => {
                            setPw(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />

                    {error && (
                        <p
                            style={{
                                fontSize: 12,
                                color: "#dc2626",
                                margin: 0,
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        style={{
                            marginTop: 4,
                            padding: "11px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#1d4ed8")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#2563eb")
                        }
                    >
                        로그인
                    </button>
                </div>

                {/* 구분선 */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        margin: "24px 0",
                    }}
                >
                    <div
                        style={{ flex: 1, height: 1, background: "#e5e5e5" }}
                    />
                    <span style={{ fontSize: 12, color: "#aaa" }}>또는</span>
                    <div
                        style={{ flex: 1, height: 1, background: "#e5e5e5" }}
                    />
                </div>

                {/* 하단 버튼 */}
                <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    <button
                        onClick={onGuest}
                        style={{
                            padding: "11px",
                            background: "#fff",
                            color: "#555",
                            border: "1px solid #e5e5e5",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#2563eb";
                            e.currentTarget.style.color = "#2563eb";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e5e5";
                            e.currentTarget.style.color = "#555";
                        }}
                    >
                        비회원으로 시작
                    </button>
                    <button
                        onClick={onSignup}
                        style={{
                            padding: "11px",
                            background: "#fff",
                            color: "#888",
                            border: "1px solid #e5e5e5",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#888";
                            e.currentTarget.style.color = "#1a1a1a";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e5e5";
                            e.currentTarget.style.color = "#888";
                        }}
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
}

function Input({ type, placeholder, value, onChange, onKeyDown }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                fontSize: 14,
                color: "#1a1a1a",
                background: "#fafafa",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s",
                fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
        />
    );
}
