import api from "./axios";

// 오늘 마이페이지 통계
export const getDailyStats = () =>
    api.get("/api/mypage/daily");