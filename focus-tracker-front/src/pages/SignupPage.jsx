import { useState } from "react";

export default function SignupPage({ onSignupComplete, onBack }) {
    const [form, setForm] = useState({
        name: "",
        birth: "",
        phone: "",
        id: "",
        password: "",
        passwordConfirm: "",
    });
    const [error, setError] = useState("");

    const set = (key, val) => {
        setForm((p) => ({ ...p, [key]: val }));
        setError("");
    };

    const handleSubmit = () => {
        const { name, birth, phone, id, password, passwordConfirm } = form;
        if (!name || !birth || !phone || !id || !password || !passwordConfirm) {
            setError("모든 항목을 입력해주세요.");
            return;
        }
        if (password !== passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }
        setError("");
        // TODO: Spring API 연결
        // 임시: 회원가입 성공 처리 후 로그인 화면으로
        onSignupComplete();
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
                {/* 헤더 */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
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
                        회원가입
                    </h1>
                </div>

                {/* 폼 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    <Input
                        placeholder="이름"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                    />
                    <Input
                        placeholder="생년월일 (예: 19990101)"
                        value={form.birth}
                        onChange={(e) => set("birth", e.target.value)}
                    />
                    <Input
                        placeholder="전화번호 (예: 01012345678)"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                    <Input
                        placeholder="아이디"
                        value={form.id}
                        onChange={(e) => set("id", e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호 확인"
                        value={form.passwordConfirm}
                        onChange={(e) => set("passwordConfirm", e.target.value)}
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
                        onClick={handleSubmit}
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
                        가입하기
                    </button>

                    <button
                        onClick={onBack}
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
                        로그인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

function Input({ type = "text", placeholder, value, onChange }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
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
