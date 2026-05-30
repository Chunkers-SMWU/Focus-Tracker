import api from "./axios";

// 일간 리포트
export const getDailyReport = () => api.get("/api/study/report");
