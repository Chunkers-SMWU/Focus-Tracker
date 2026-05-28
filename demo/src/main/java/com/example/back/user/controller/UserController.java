package com.example.back.user.controller;

import com.example.back.user.dto.LoginReqDTO;
import com.example.back.user.dto.LoginResDTO;
import com.example.back.user.dto.SignupReqDTO;
import com.example.back.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원가입 - POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(
            @RequestBody @Valid SignupReqDTO dto
    ) {
        userService.signup(dto);
        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다."));
    }

    // 로그인 - POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResDTO> login(
            @RequestBody @Valid LoginReqDTO dto
    ) {
        return ResponseEntity.ok(userService.login(dto));
    }

    // 로그아웃 - POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }
}
