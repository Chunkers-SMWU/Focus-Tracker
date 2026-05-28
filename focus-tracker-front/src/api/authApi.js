import api from "./axios";

export async function login({ id, password }) {
    const res = await api.post("/api/auth/login", { id, password });
    return res.data;
}

export async function signup({ name, birth, phone, id, password }) {
    const res = await api.post("/api/auth/signup", { name, birth, phone, id, password });
    return res.data;
}

export async function logout() {
    const res = await api.post("/api/auth/logout");
    return res.data;
}