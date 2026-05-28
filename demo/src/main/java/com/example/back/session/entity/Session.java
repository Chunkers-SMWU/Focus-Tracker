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
    private int totalTime;    // 총 학습 시간
    private int maxFocusTime; // 최대 집중 시간
    private int focusScore;       // 종합 집중도 (0~100)
    private int alertCount;   // 총 경고 횟수



}
