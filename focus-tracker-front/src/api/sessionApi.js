import api from "./axios";

export async function saveSession(payload) {
    const res = await api.post("/api/session/save", payload);
    return res.data;
}

export async function getSessionHistory() {
    const res = await api.get("/api/session/history");
    return res.data;
}