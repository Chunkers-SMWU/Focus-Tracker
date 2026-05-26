package com.example.back.session.repository;

import com.example.back.session.entity.Session;
import com.example.back.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByUser(User user);

    @Query("SELECT s FROM Session s WHERE s.user = :user AND DATE(s.startedAt) = :date")
    List<Session> findByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT s FROM Session s WHERE s.user = :user AND DATE(s.startedAt) >= :date")
    List<Session> findByUserAndDateAfter(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT s FROM Session s WHERE s.user = :user ORDER BY s.startedAt DESC")
    List<Session> findByUserOrderByCreatedAtDesc(@Param("user") User user);

    // 마이페이지용 집계 쿼리

    // 종합 집중도: 전체 세션의 focusScore 평균
    @Query("SELECT AVG(s.focusScore) FROM Session s WHERE s.user = :user")
    Double findAvgFocusScoreByUser(@Param("user") User user);

    // 최대 집중 시간: 단일 세션 중 가장 긴 focusTime
    @Query("SELECT MAX(s.focusTime) FROM Session s WHERE s.user = :user")
    Integer findMaxFocusTimeByUser(@Param("user") User user);

    // 세션 이용 시간: 전체 totalTime 합계
    @Query("SELECT SUM(s.totalTime) FROM Session s WHERE s.user = :user")
    Integer findTotalSessionTimeByUser(@Param("user") User user);
}