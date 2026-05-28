package com.example.back.session.controller;

import com.example.back.session.dto.MyPageResDto;
import com.example.back.session.dto.SessionReqDto;
import com.example.back.session.dto.SessionResDto;
import com.example.back.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/save")
    public ResponseEntity<SessionResDto> saveSession(
            @AuthenticationPrincipal String loginId,  // UserDetails → String 으로 변경
            @RequestBody SessionReqDto dto) {
        return ResponseEntity.ok(sessionService.saveSession(loginId, dto));
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, List<SessionResDto>>> getHistory(
            @AuthenticationPrincipal String loginId) {
        return ResponseEntity.ok(sessionService.getSessionHistory(loginId));
    }

/*  // 마이페이지 통계 조회
    // GET /api/session/mypage
    @GetMapping("/mypage")
    public ResponseEntity<MyPageResDto> getMyPageStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionService.getMyPageStats(userDetails.getUsername()));
    }*/
}