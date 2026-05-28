package com.example.back.session.dto;

import com.example.back.session.entity.Session;
import com.example.back.session.enums.SessionMode;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionResDto {
    private SessionMode mode;
    private int focusSeconds;
    private int nonFocusSeconds;
    private int totalSeconds;
    private int focusScore;
    private int alertCount;
    private int maxFocusTime;  // ← 추가

    public static SessionResDto from(Session session) {
        return SessionResDto.builder()
                .mode(session.getMode())
                .focusSeconds(session.getFocusTime())
                .nonFocusSeconds(session.getNonFocusTime())
                .totalSeconds(session.getTotalTime())
                .focusScore(session.getFocusScore())
                .alertCount(session.getAlertCount())
                .maxFocusTime(session.getMaxFocusTime())  // ← 추가
                .build();
    }
}