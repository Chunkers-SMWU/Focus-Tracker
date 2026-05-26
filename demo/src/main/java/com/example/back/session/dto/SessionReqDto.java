package com.example.back.session.dto;

import com.example.back.session.entity.Session;
import com.example.back.session.enums.SessionMode;
import lombok.Getter;

@Getter
public class SessionReqDto {
    private int focusTime;
    private int nonFocusTime;
    private int totalTime;

    private int yawnCount;
    private int poseCount;
    private double blinkRate;

    private int headTurnCount;
    private int eyeCloseTime;
    private int headDownCount;
    private int focusScore;

    private int tabSwitchCount;
    private int tabLeaveTime;
    private int shortSwitchCount;
    private int unauthorizedAccessCount;

    private SessionMode mode;  // 강의시청, 자료검색, 잠금, 휴식
}