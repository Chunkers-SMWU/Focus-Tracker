package com.example.back.study_report.controller;

import com.example.back.study_report.dto.ReportResDTO;
import com.example.back.study_report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/report")
    public ResponseEntity<ReportResDTO> getDaily(
            @AuthenticationPrincipal String loginId) {  // UserDetails → String
        return ResponseEntity.ok(reportService.getDaily(loginId));
    }

/*    // 주간 리포트 - GET /api/report/weekly
    @GetMapping("/weekly")
    public ResponseEntity<ReportResDTO> getWeekly(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportService.getWeekly(userDetails.getUsername()));
    }*/
}