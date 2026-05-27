const FOCUS_TRACKER_ORIGIN = "http://localhost:5173"; // 배포 시 실제 도메인으로 교체

// 차단/허용 사이트 목록 + 설정
let blockedSites = [];
let allowedSites = [];
let allowPopup = false;

// 금지 사이트 접속 횟수 추적
const blockedAccessCount = {};

// Focus Tracker 탭 ID
let focusTrackerTabId = null;

// 확장 로드 시 이미 열려있는 Focus Tracker 탭 ID 미리 등록
chrome.tabs.query({ url: `${FOCUS_TRACKER_ORIGIN}/*` }, (tabs) => {
    if (tabs.length > 0) focusTrackerTabId = tabs[0].id;
});

// storage에서 차단/허용 목록 + 설정 초기 로드
chrome.storage.local.get(
    ["blockedSites", "allowedSites", "allowPopup"],
    (res) => {
        if (res.blockedSites) {
            blockedSites = res.blockedSites;
        } else {
            const defaults = ["youtube.com", "instagram.com", "twitter.com"];
            blockedSites = defaults;
            chrome.storage.local.set({ blockedSites: defaults });
        }
        allowedSites = res.allowedSites ?? [];
        allowPopup = res.allowPopup ?? false;
    },
);

// 차단/허용 목록 + 설정 변경 시 동기화
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.blockedSites)
        blockedSites = changes.blockedSites.newValue ?? [];
    if (changes.allowedSites)
        allowedSites = changes.allowedSites.newValue ?? [];
    if (changes.allowPopup) allowPopup = changes.allowPopup.newValue ?? false;
});

// 차단 여부 체크 + 접속 횟수 추적
function isBlocked(url) {
    if (!url) return false;
    return blockedSites.some((site) => url.includes(site));
}

function getBlockedSite(url) {
    if (!url) return null;
    return blockedSites.find((site) => url.includes(site)) ?? null;
}

function isAllowed(url) {
    if (!url) return false;
    return allowedSites.some((site) => url.includes(site));
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

    updateFocusTrackerTabId(url, tabId);

    const blocked = isBlocked(url);
    const allowed = isAllowed(url);

    // 금지 사이트 2회 접속 시 팝업 요청
    if (blocked && allowPopup) {
        const site = getBlockedSite(url);
        blockedAccessCount[site] = (blockedAccessCount[site] ?? 0) + 1;
        if (blockedAccessCount[site] === 2) {
            blockedAccessCount[site] = 0; // 카운트 리셋
            sendToFocusTracker({ type: "BLOCKED_TWICE", site });
        }
    }

    sendToFocusTracker({ type: "TAB_CHANGED", url, blocked, allowed });
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
