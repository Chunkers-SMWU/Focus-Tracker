package com.example.back.daily.controller;

import com.example.back.daily.dto.DailyResDto;
import com.example.back.daily.service.DailyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class DailyController {

    private final DailyService dailyService;

    // 오늘 마이페이지 통계 조회
    // GET /api/daily/mypage
    @GetMapping("/daily")
    public ResponseEntity<DailyResDto> getMyPageStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dailyService.getTodayStats(userDetails.getUsername()));
    }
}