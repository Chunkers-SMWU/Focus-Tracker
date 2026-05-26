package com.example.back.daily.service;

import com.example.back.daily.dto.DailyResDto;
import com.example.back.daily.entity.Daily;
import com.example.back.daily.repository.DailyRepository;
import com.example.back.user.entity.User;
import com.example.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DailyService {

    private final DailyRepository dailyRepository;
    private final UserRepository userRepository;

    public DailyResDto getTodayStats(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Daily daily = dailyRepository.findByUserAndDate(user, LocalDate.now())
                .orElse(Daily.builder()
                        .date(LocalDate.now())
                        .avgFocusScore(0.0)
                        .maxFocusTime(0)
                        .totalSessionTime(0)
                        .sessionCount(0)
                        .build());

        return DailyResDto.from(daily);
    }
}