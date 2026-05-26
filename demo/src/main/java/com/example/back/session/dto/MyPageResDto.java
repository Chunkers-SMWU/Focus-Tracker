package com.example.back.session.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyPageResDto {

    private double avgFocusScore;   // 종합 집중도 (전체 세션 평균, 0~100)
    private int maxFocusTime;       // 최대 집중 시간 (단일 세션 중 가장 긴 집중 시간, 초)
    private int totalSessionTime;   // 세션 이용 시간 (전체 누적 세션 시간, 초)
}