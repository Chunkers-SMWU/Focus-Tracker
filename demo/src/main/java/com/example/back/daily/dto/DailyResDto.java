package com.example.back.daily.dto;

import com.example.back.daily.entity.Daily;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DailyResDto {

    private LocalDate date;
    private double avgFocusScore;    // 종합 집중도
    private int maxFocusTime;        // 최대 집중 시간 (초)
    private int totalSessionTime;    // 세션 이용 시간 (초)

    public static DailyResDto from(Daily daily) {
        return DailyResDto.builder()
                .date(daily.getDate())
                .avgFocusScore(daily.getAvgFocusScore())
                .maxFocusTime(daily.getMaxFocusTime())
                .totalSessionTime(daily.getTotalSessionTime())
                .build();
    }
}