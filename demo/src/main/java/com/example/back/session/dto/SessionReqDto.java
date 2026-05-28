package com.example.back.session.dto;

import com.example.back.session.enums.SessionMode;
import lombok.Getter;

@Getter
public class SessionReqDto {
    private SessionMode mode;
    private int focusTime;
    private int nonFocusTime;
    private int totalTime;
    private int focusScore;
    private int alertCount;
}