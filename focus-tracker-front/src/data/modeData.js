export const modeData = {
    강의: {
        label: "강의시청",
        values: {
            tabSwitch: null,
            tabAway: 5,
            rapidSwitch: 1,
            blockedAccess: 1,
        },
        units: {
            tabSwitch: null,
            tabAway: "분",
            rapidSwitch: "회",
            blockedAccess: "회",
        },
    },
    자료: {
        label: "자료검색",
        values: {
            tabSwitch: null,
            tabAway: null,
            rapidSwitch: null,
            blockedAccess: 1,
        },
        units: {
            tabSwitch: null,
            tabAway: null,
            rapidSwitch: null,
            blockedAccess: "회",
        },
    },
    잠금: {
        label: "잠금",
        values: { tabSwitch: 1, tabAway: 10, rapidSwitch: 1, blockedAccess: 1 },
        units: {
            tabSwitch: "회",
            tabAway: "초",
            rapidSwitch: "회",
            blockedAccess: "회",
        },
    },
    휴식: {
        label: "휴식(시간제한)",
        values: {
            tabSwitch: null,
            tabAway: null,
            rapidSwitch: null,
            blockedAccess: null,
        },
        units: {
            tabSwitch: null,
            tabAway: null,
            rapidSwitch: null,
            blockedAccess: null,
        },
    },
};

export const fieldMap = [
    { id: "tab-switch", key: "tabSwitch", label: "탭 전환 횟수" },
    { id: "tab-away", key: "tabAway", label: "탭 이탈 누적 시간" },
    { id: "rapid-switch", key: "rapidSwitch", label: "짧은 간격 반복 전환" },
    {
        id: "blocked-access",
        key: "blockedAccess",
        label: "허용되지 않은 창 접속",
    },
];
