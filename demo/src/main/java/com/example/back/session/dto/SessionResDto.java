package com.example.back.session.dto;

import com.example.back.session.entity.Session;
import com.example.back.session.enums.SessionMode;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class SessionResDto {
    private Long id;
    private SessionMode mode;   // 4가지 세션
    private int focusTime;
    private int nonFocusTime;
    private int totalTime;
    private int focusScore;

    public static SessionResDto from(Session session) {
        return SessionResDto.builder()
                .id(session.getId())
                .mode(session.getMode())       // ← 추가
                .focusTime(session.getFocusTime())
                .nonFocusTime(session.getNonFocusTime())
                .totalTime(session.getTotalTime())
                .focusScore(session.getFocusScore())
                .build();
    }
}