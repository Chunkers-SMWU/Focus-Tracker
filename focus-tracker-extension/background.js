const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

// 차단 사이트 목록
let blockedSites = [];

// Focus Tracker 탭 ID
let focusTrackerTabId = null;

// 확장 로드 시 이미 열려있는 Focus Tracker 탭 ID 미리 등록
chrome.tabs.query({ url: `${FOCUS_TRACKER_ORIGIN}/*` }, (tabs) => {
    if (tabs.length > 0) focusTrackerTabId = tabs[0].id;
});

// storage에서 차단 목록 초기 로드
chrome.storage.local.get("blockedSites", (res) => {
    if (res.blockedSites) {
        blockedSites = res.blockedSites;
    } else {
        const defaults = ["youtube.com", "instagram.com", "twitter.com"];
        blockedSites = defaults;
        chrome.storage.local.set({ blockedSites: defaults });
    }
});

// 차단 목록 변경 시 동기화
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue ?? [];
    }
});

// 차단 여부 체크
function isBlocked(url) {
    if (!url) return false;
    return blockedSites.some((site) => url.includes(site));
}

// Focus Tracker 탭 ID 갱신
function updateFocusTrackerTabId(url, tabId) {
    if (url && url.startsWith(FOCUS_TRACKER_ORIGIN)) {
        focusTrackerTabId = tabId;
    }
}

// Focus Tracker 탭에만 메시지 전송
function sendToFocusTracker(data) {
    if (!focusTrackerTabId) return;
    chrome.tabs.sendMessage(focusTrackerTabId, data).catch(() => {
        // Focus Tracker 탭이 닫혔거나 아직 로드 안 된 경우 무시
        focusTrackerTabId = null;
    });
}

// 탭 변경 처리
function handleTabChange(tabId, url) {
    if (!url || url.startsWith("chrome://")) return;

    // Focus Tracker 탭 ID 갱신 (Focus Tracker로 전환 시)
    updateFocusTrackerTabId(url, tabId);

    // 어느 탭으로 전환되든 항상 Focus Tracker 탭으로 메시지 전송
    sendToFocusTracker({
        type: "TAB_CHANGED",
        url,
        blocked: isBlocked(url),
    });
}

// 탭 활성화 (다른 탭으로 전환)
chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        handleTabChange(tabId, tab.url);
    });
});

// URL 변경 (같은 탭에서 페이지 이동)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    handleTabChange(tabId, tab.url);
});
