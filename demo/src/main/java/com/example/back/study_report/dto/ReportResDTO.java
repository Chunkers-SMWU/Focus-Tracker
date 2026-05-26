package com.example.back.study_report.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportResDTO {

    private int sessionCount;       // 세션 수
    private int totalTime;          // 세션 이용 시간 (초)
    private int focusTime;          // 집중 시간 (초)
    private int nonFocusTime;       // 비집중 시간 (초)
    private double avgFocusScore;   // 종합 집중도 (평균)
    private int maxFocusTime;       // 최대 집중 시간 (초)
}