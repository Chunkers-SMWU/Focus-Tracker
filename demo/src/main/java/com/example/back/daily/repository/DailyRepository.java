package com.example.back.daily.repository;
import java.util.List;
import com.example.back.daily.entity.Daily;
import com.example.back.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyRepository extends JpaRepository<Daily, Long> {
    List<Daily> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
    // 특정 유저의 오늘 Daily 조회
    Optional<Daily> findByUserAndDate(User user, LocalDate date);
}