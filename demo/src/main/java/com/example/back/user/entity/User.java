package com.example.back.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String birth;           // 예: "19990101"

    @Column(nullable = false)
    private String phone;           // 예: "01012345678"

    @Column(nullable = false, unique = true)
    private String loginId;         // 아이디

    @Column(nullable = false)
    private String password;        // BCrypt 암호화 저장
}
