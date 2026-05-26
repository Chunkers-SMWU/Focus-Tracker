package com.example.back.session.entity;
import com.example.back.session.enums.SessionMode;
import com.example.back.user.entity.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "session")
public class Session extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private SessionMode mode;

//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 시간 정보
    private int focusTime;    // 집중 시간
    private int nonFocusTime; // 비집중 시간
    private int totalTime;    // 전체 시간

    // 졸음 감지
    private int yawnCount;     // 하품 횟수
    private int poseCount;     // 자세 불량 횟수
    private double blinkRate;     // 깜빡임 (회/분)

    // 집중도 모니터링
    private int headTurnCount;    // 고개 방향 횟수
    private int eyeCloseTime;     // 눈 감김 시간 (초)
    private int headDownCount;    // 고개 숙임 횟수
    private int focusScore;       // 종합 집중도 (0~100)

    // 탭 활동
    private int tabSwitchCount;         // 탭 전환 횟수
    private int tabLeaveTime;           // 탭 이탈 누적 시간 (초)
    private int shortSwitchCount;       // 짧은 간격 반복 전환
    private int unauthorizedAccessCount; // 허용되지 않은 창 접속
}
