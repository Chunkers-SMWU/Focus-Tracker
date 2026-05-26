import { useState } from "react";
import styles from "./SignupPage.module.css";

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

    const handleSubmit = async () => {
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

        try {
            const res = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, birth, phone, id, password }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("회원가입이 완료되었습니다!");
                onSignupComplete();
            } else {
                setError(data.message || "회원가입에 실패했습니다.");
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
                    <h1 className={styles.title}>회원가입</h1>
                </div>

                <div className={styles.form}>
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

                    {error && <p className={styles.errorText}>{error}</p>}

                    <button className={styles.submitBtn} onClick={handleSubmit}>
                        가입하기
                    </button>
                    <button className={styles.backBtn} onClick={onBack}>
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
            className={styles.input}
        />
    );
}
