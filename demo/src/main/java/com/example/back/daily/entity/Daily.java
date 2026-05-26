package com.example.back.daily.entity;

import com.example.back.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "daily")
public class Daily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate date;          // 날짜

    private double avgFocusScore;    // 종합 집중도 (당일 세션들의 평균)
    private int maxFocusTime;        // 최대 집중 시간 (당일 세션 중 가장 긴 focusTime)
    private int totalSessionTime;    // 세션 이용 시간 (당일 totalTime 누적 합)
    private int sessionCount;        // 당일 세션 수 (평균 재계산용)

    public void update(double avgFocusScore, int maxFocusTime, int totalSessionTime, int sessionCount) {
        this.avgFocusScore = avgFocusScore;
        this.maxFocusTime = maxFocusTime;
        this.totalSessionTime = totalSessionTime;
        this.sessionCount = sessionCount;
    }
}