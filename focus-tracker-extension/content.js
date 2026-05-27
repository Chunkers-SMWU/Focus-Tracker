const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

// 웹앱 → content.js 메시지 수신
window.addEventListener("message", (e) => {
    if (e.origin !== FOCUS_TRACKER_ORIGIN) return;

    // 차단 목록 저장 요청
    if (e.data?.type === "SAVE_SITES") {
        chrome.storage.local.set({ blockedSites: e.data.sites });
    }

    // 차단 목록 로드 요청
    if (e.data?.type === "LOAD_SITES") {
        chrome.storage.local.get("blockedSites", (res) => {
            window.postMessage(
                { type: "SITES_LOADED", sites: res.blockedSites ?? null },
                FOCUS_TRACKER_ORIGIN,
            );
        });
    }

    // allowPopup 설정 저장 요청
    if (e.data?.type === "SAVE_ALLOW_POPUP") {
        chrome.storage.local.set({ allowPopup: e.data.value });
    }

    // 허용 목록 저장 요청
    if (e.data?.type === "SAVE_ALLOWED_SITES") {
        chrome.storage.local.set({ allowedSites: e.data.sites });
    }

    // 허용 목록 로드 요청
    if (e.data?.type === "LOAD_ALLOWED_SITES") {
        chrome.storage.local.get("allowedSites", (res) => {
            window.postMessage(
                {
                    type: "ALLOWED_SITES_LOADED",
                    sites: res.allowedSites ?? null,
                },
                FOCUS_TRACKER_ORIGIN,
            );
        });
    }
});

// background.js → content.js 메시지 수신
chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== "TAB_CHANGED" && message.type !== "BLOCKED_TWICE")
        return;
    window.postMessage(message, FOCUS_TRACKER_ORIGIN);
});
