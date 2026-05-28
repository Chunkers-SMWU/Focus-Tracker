package com.example.back.daily.controller;
import java.util.List;
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

    @GetMapping("/daily")
    public ResponseEntity<DailyResDto> getMyPageStats(
            @AuthenticationPrincipal String loginId) {  // UserDetails → String
        return ResponseEntity.ok(dailyService.getTodayStats(loginId));  // getUsername() 제거
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<DailyResDto>> getCalendar(
            @AuthenticationPrincipal String loginId,  // UserDetails → String
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(dailyService.getMonthlyStats(loginId, year, month));
    }
}