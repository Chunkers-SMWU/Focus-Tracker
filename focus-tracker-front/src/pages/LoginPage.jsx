import { useState } from "react";
import styles from "./LoginPage.module.css";

export default function LoginPage({ onLogin, onGuest, onSignup }) {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!id.trim() || !pw.trim()) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }
        setError("");

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password: pw }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                onLogin({ id, name: data.name });
            } else {
                setError(data.message || "로그인에 실패했습니다.");
            }
        } catch (e) {
            setError("서버에 연결할 수 없습니다.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <p className={styles.brand}>Focus Tracker</p>
                    <h1 className={styles.title}>로그인</h1>
                </div>

                <div className={styles.form}>
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

                    {error && <p className={styles.errorText}>{error}</p>}

                    <button className={styles.loginBtn} onClick={handleLogin}>
                        로그인
                    </button>
                </div>

                <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerText}>또는</span>
                    <div className={styles.dividerLine} />
                </div>

                <div className={styles.subBtns}>
                    <button className={styles.guestBtn} onClick={onGuest}>
                        비회원으로 시작
                    </button>
                    <button className={styles.signupBtn} onClick={onSignup}>
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
            className={styles.input}
        />
    );
}
