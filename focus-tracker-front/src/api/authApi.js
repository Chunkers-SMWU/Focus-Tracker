const BASE_URL = "http://localhost:8080";

/**
 * 로그인
 * POST /api/auth/login
 * @param {{ id: string, password: string }} credentials
 * @returns {Promise<{ token: string, name: string }>}
 */
export async function login({ id, password }) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "로그인에 실패했습니다.");
    return data;
}

/**
 * 회원가입
 * POST /api/auth/signup
 * @param {{ name: string, birth: string, phone: string, id: string, password: string }} form
 * @returns {Promise}
 */
export async function signup({ name, birth, phone, id, password }) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birth, phone, id, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "회원가입에 실패했습니다.");
    return data;
}

/**
 * 로그아웃
 * POST /api/auth/logout
 * @returns {Promise}
 */
export async function logout() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    if (!res.ok) throw new Error("로그아웃에 실패했습니다.");
    return res.json();
}
