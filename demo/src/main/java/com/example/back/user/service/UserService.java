package com.example.back.user.service;

import com.example.back.user.dto.LoginReqDTO;
import com.example.back.user.dto.LoginResDTO;
import com.example.back.user.dto.SignupReqDTO;
import com.example.back.user.entity.User;
import com.example.back.user.jwt.JwtUtil;
import com.example.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 회원가입
    @Transactional
    public void signup(SignupReqDTO dto) {
        if (userRepository.existsByLoginId(dto.id())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        User user = User.builder()
                .name(dto.name())
                .birth(dto.birth())
                .phone(dto.phone())
                .loginId(dto.id())
                .password(passwordEncoder.encode(dto.password()))
                .build();

        userRepository.save(user);
    }

    // 로그인
    @Transactional(readOnly = true)
    public LoginResDTO login(LoginReqDTO dto) {
        User user = userRepository.findByLoginId(dto.id())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtUtil.generateToken(user.getLoginId());

        return LoginResDTO.builder()
                .token(token)
                .name(user.getName())
                .build();
    }
}
